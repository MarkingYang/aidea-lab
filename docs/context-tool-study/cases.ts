import assert from "node:assert/strict";
import { Effect, Deferred, Fiber } from "effect";
import { make } from "opencode/packages/core/src/session/run-coordinator.ts";
import { closeTrailingOpenToolExchange } from "kimi/agent/contextMemory/openToolExchange.ts";
import { DefaultCompactionStrategy, DEFAULT_COMPACTION_CONFIG } from "kimi/agent/fullCompaction/strategy.ts";
import { createMachineTools } from "kimi/agent/loop/machine/tools.ts";
import { parseToolCallArguments } from "kimi/tool/tool-args-parse.ts";
import { ToolOutputAccumulator } from "kimi/tool/output-accumulator.ts";
import { DEFAULT_TOOL_RESULT_MAX_RETAINED_CHARS } from "kimi/tool/toolContract.ts";

export async function runCases() {
  const results: Record<string, unknown> = {};
  const msg = (role: string, text = "", toolCalls: any[] = [], toolCallId?: string) => ({
    role, content: text ? [{ type: "text", text }] : [], toolCalls, toolCallId,
  });
  const a = { id: "a", name: "read", arguments: "{}" };
  const b = { id: "b", name: "read", arguments: "{}" };
  const history: any[] = [msg("user", "inspect files"), { ...msg("assistant", "", [a, b]), partial: true }, msg("tool", "A exists", [], "a")];
  const original = JSON.stringify(history);
  const closed = closeTrailingOpenToolExchange(history as any);
  assert.equal(closed.length, 4);
  assert.equal(closed[3].toolCallId, "b");
  assert.match((closed[3].content[0] as any).text, /outcome is unknown/);
  assert.equal(closed[1].partial, undefined);
  assert.equal(JSON.stringify(history), original);
  results.kimi_inherited_open_call = { known: "a", unknown: "b", input_unmodified: true };

  const strategy = new DefaultCompactionStrategy(() => 100_000);
  assert.equal(strategy.budget().triggerTokens, 50_000);
  assert.equal(strategy.shouldCompact(49_999), false);
  assert.equal(strategy.shouldCompact(50_000), true);
  const sequence: any[] = [msg("user", "old task"), msg("assistant", "old answer"), msg("user", "new task"), msg("assistant", "", [a, b]), msg("tool", "A", [], "a"), msg("tool", "B", [], "b"), msg("assistant", "done")];
  const window = new DefaultCompactionStrategy(() => 1000, { ...DEFAULT_COMPACTION_CONFIG, maxRecentMessages: 4 }, () => 10);
  const cut = window.computeCompactCount(sequence as any, "auto" as any);
  assert.equal(cut, 6);
  const wider = new DefaultCompactionStrategy(() => 1000, { ...DEFAULT_COMPACTION_CONFIG, maxRecentMessages: 5 }, () => 10);
  const widerCut = wider.computeCompactCount(sequence as any, "auto" as any);
  assert.equal(widerCut, 2);
  results.kimi_compaction_boundary = { threshold: 50_000, compacted_prefix_messages: cut, wider_window_prefix_messages: widerCut, tool_exchange_not_split: true, estimator: "fixed 10 tokens per message for boundary case" };

  assert.equal(parseToolCallArguments('{"path":').parseFailed, true);
  assert.equal(parseToolCallArguments("").parseFailed, false);
  results.kimi_argument_parsing = { malformed_rejected_by_parse_flag: true, empty_becomes_object: true };

  let batches = 0;
  const bridge = createMachineTools({
    turnId: () => 1,
    toolInfos: [{ name: "read", description: "test reader" }] as any,
    toolExecutor: { async *execute(calls: any[]) { batches++; yield { toolCallId: calls[0].id, result: { output: "known A" } }; } } as any,
  });
  bridge.beginBatch([a, b] as any);
  const controller = new AbortController();
  const pendingA = bridge.tools[0].execute!({ toolCall: a, signal: controller.signal } as any);
  assert.equal(batches, 0);
  const pendingB = bridge.tools[0].execute!({ toolCall: b, signal: controller.signal } as any);
  const [answerA, answerB] = await Promise.all([pendingA, pendingB]);
  assert.equal(batches, 1);
  assert.equal(answerA.isError, undefined);
  assert.equal(answerB.isError, true);
  assert.match((answerB.content[0] as any).text, /produced no result/);
  results.kimi_batch_missing_result = { batches, a: "known result", b: "explicit error" };

  let abortedBatches = 0;
  const abortBridge = createMachineTools({ turnId: () => 1, toolInfos: [{ name: "read", description: "test" }] as any,
    toolExecutor: { async *execute() { abortedBatches++; } } as any });
  abortBridge.beginBatch([a, b] as any);
  const cancel = new AbortController();
  const pending = abortBridge.tools[0].execute!({ toolCall: a, signal: cancel.signal } as any);
  cancel.abort();
  const aborted = await pending;
  assert.equal(aborted.isError, true);
  assert.equal(abortedBatches, 0);
  results.kimi_cancel_before_batch_ready = { dispatched: 0, error_returned: true };

  const output = new ToolOutputAccumulator();
  output.write("x".repeat(DEFAULT_TOOL_RESULT_MAX_RETAINED_CHARS + 5));
  const retained = output.ok();
  assert.equal(output.totalChars, 10_000_005);
  assert.equal(output.nChars, 10_000_000);
  assert.equal(retained.spill?.totalChars, 10_000_005);
  results.kimi_output_retention = { total_chars: output.totalChars, retained_chars: output.nChars, omitted: 5 };

  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const started = yield* Deferred.make<void>();
    const gate = yield* Deferred.make<void>();
    let runs = 0;
    const coordinator = yield* make({ drain: () => Effect.gen(function* () {
      runs++; yield* Deferred.succeed(started, undefined); yield* Deferred.await(gate);
    }) });
    const first = yield* coordinator.run("same").pipe(Effect.forkChild);
    yield* Deferred.await(started);
    const second = yield* coordinator.run("same").pipe(Effect.forkChild);
    yield* Effect.yieldNow;
    assert.equal(runs, 1);
    yield* Deferred.succeed(gate, undefined);
    yield* Effect.all([Fiber.join(first), Fiber.join(second)]);
    results.opencode_same_key_join = { drain_calls: runs };
  })));
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const started = yield* Deferred.make<void>();
    const gate = yield* Deferred.make<void>();
    let runs = 0;
    const coordinator = yield* make({ drain: () => Effect.gen(function* () {
      runs++; yield* Deferred.succeed(started, undefined); yield* Deferred.await(gate);
    }) });
    const first = yield* coordinator.run("same").pipe(Effect.forkChild);
    yield* Deferred.await(started);
    yield* coordinator.wake("same");
    yield* coordinator.wake("same");
    yield* Deferred.succeed(gate, undefined);
    yield* Fiber.join(first);
    assert.equal(runs, 2);
    results.opencode_wake_coalescing = { wake_calls: 2, drain_calls: runs };
  })));
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const started = yield* Deferred.make<void>();
    let cleaned = false;
    const coordinator = yield* make({ drain: () => Deferred.succeed(started, undefined).pipe(
      Effect.andThen(Effect.never), Effect.ensuring(Effect.sync(() => { cleaned = true; }))) });
    const owner = yield* coordinator.run("cancel").pipe(Effect.forkChild);
    yield* Deferred.await(started);
    yield* coordinator.interrupt("cancel");
    assert.equal(cleaned, true);
    yield* Fiber.await(owner);
    results.opencode_interrupt_cleanup = { cleanup_finished: cleaned };
  })));
  return results;
}

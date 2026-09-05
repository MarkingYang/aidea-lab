import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const outputRoot = path.resolve('dist');
const graphHtml = fs.readFileSync(path.join(outputRoot, 'graph/index.html'), 'utf8');
const payload = graphHtml.match(/<script type="application\/json" id="knowledge-graph-data">([\s\S]*?)<\/script>/)?.[1];
assert.ok(payload, 'The built graph page must embed its graph data');

const graph = JSON.parse(payload);
const nodeIds = new Set(graph.nodes.map(node => node.id));
const articleIds = new Set(graph.nodes.filter(node => node.kind === 'article').map(node => node.id));
const builtArticleIds = new Set(
  fs.readdirSync(path.join(outputRoot, 'writing'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name),
);

assert.equal(nodeIds.size, graph.nodes.length, 'Graph node ids must be unique');
assert.deepEqual([...articleIds].sort(), [...builtArticleIds].sort(), 'Every built article must have exactly one graph node');
assert.ok(graph.links.every(link => nodeIds.has(link.source) && nodeIds.has(link.target)), 'Every graph edge must point to existing nodes');

const maintainedSeries = new Map([
  ['agent-work-systems', [
    'ai-agent-landscape-2026',
    'agent-landscape-comparison-methods',
    'coding-agent-harness-showdown',
    'open-source-agent-harness-routes',
    'coding-agent-harness-poc',
    'china-work-agent-showdown',
    'china-work-agent-adoption',
    'agent-work-system-synthesis',
  ]],
  ['composable-agent-harness', [
    'composable-agent-harness-architecture',
    'composable-agent-harness-research-method',
    'composable-agent-harness-synthesis',
  ]],
  ['mem0-system', [
    'mem0-series-overview',
    'mem0-add-pipeline',
    'mem0-hybrid-retrieval',
    'mem0-production-boundaries',
    'mem0-series-synthesis',
  ]],
  ['openviking-system', [
    'openviking-series-overview',
    'openviking-context-layers',
    'openviking-hierarchical-retrieval',
    'openviking-session-governance',
    'openviking-series-synthesis',
  ]],
  ['tencentdb-agent-memory-system', [
    'tencentdb-agent-memory-overview',
    'tencentdb-agent-memory-proxy',
    'tencentdb-agent-memory-layers',
    'tencentdb-agent-memory-governance',
    'tencentdb-agent-memory-synthesis',
  ]],
  ['hermes-agent-system', [
    'hermes-agent-series-overview',
    'hermes-agent-architecture-deep-dive',
    'hermes-agent-runtime-services',
    'hermes-agent-memory-governance',
    'hermes-agent-series-synthesis',
  ]],
  ['claude-code-system', [
    'claude-code-internals-overview',
    'claude-code-agent-loop',
    'claude-code-memory-extension',
    'claude-code-internals-synthesis',
  ]],
  ['codex-system', [
    'codex-system-overview',
    'codex-runtime-sandbox',
    'codex-skills-memory-automation',
    'codex-system-synthesis',
  ]],
  ['opencode-system', [
    'opencode-system-overview',
    'opencode-client-server-runtime',
    'opencode-agents-skills-plugins',
    'opencode-system-synthesis',
  ]],
  ['kimi-code-system', [
    'kimi-code-system-overview',
    'kimi-code-session-runtime',
    'kimi-code-skills-swarm',
    'kimi-code-system-synthesis',
  ]],
  ['pi-system', [
    'pi-series-overview',
    'pi-architecture-deep-dive',
    'pi-session-extension-architecture',
    'pi-durable-harness-governance',
    'pi-series-synthesis',
  ]],
  ['addy-agent-skills', [
    'addy-agent-skills-overview',
    'addy-agent-skills-lifecycle',
    'addy-agent-skills-verification',
    'addy-agent-skills-synthesis',
  ]],
  ['anthropic-agent-skills', [
    'anthropic-skills-overview',
    'anthropic-skills-progressive-disclosure',
    'anthropic-skills-document-pipelines',
    'anthropic-skills-synthesis',
  ]],
  ['ecc-system', [
    'ecc-series-overview',
    'ecc-architecture-deep-dive',
    'ecc-hook-runtime-memory',
    'ecc-memory-supply-chain',
    'ecc-series-synthesis',
  ]],
  ['mattpocock-skills', [
    'mattpocock-skills-overview',
    'mattpocock-skills-alignment',
    'mattpocock-skills-feedback-loops',
    'mattpocock-skills-synthesis',
  ]],
  ['trustworthy-agent-engineering', [
    'ai-agent-reliability-boundaries',
    'agent-reliability-adoption',
    'anthropic-harness',
    'anthropic-harness-practice',
    'trace-framework-deep-dive',
    'trace-lite-production',
    'trustworthy-agent-engineering-synthesis',
  ]],
  ['ai-capability-boundaries', [
    'llm-agent-capability-landscape-2026',
    'ai-capability-evidence-action',
    'ai-capability-boundary-synthesis',
  ]],
  ['ai-product-work', [
    'product-work-methodology',
    'agent-product-contracts-context',
    'agent-product-evaluation-rhythm',
    'lu-qi-researcher-founder',
    'researcher-founder-thinking',
    'learning-organization-boundaries',
    'ai-product-work-synthesis',
  ]],
]);
for (const [seriesId, expectedArticles] of maintainedSeries) {
  const hubId = `series:${seriesId}`;
  assert.ok(graph.nodes.some(node => node.id === hubId), `${seriesId} must become a graph hub`);
  assert.deepEqual(
    graph.nodes.filter(node => node.seriesId === seriesId && node.kind === 'article').map(node => node.id).sort(),
    [...expectedArticles].sort(),
    `All chapters must be maintained in the ${seriesId} knowledge circle`,
  );
  assert.ok(expectedArticles.every(id => graph.links.some(link =>
    link.relation === 'series' && [link.source, link.target].includes(hubId) && [link.source, link.target].includes(id)
  )), `Every ${seriesId} chapter must connect to its series hub`);
}
assert.equal(graph.layout?.type, 'force-directed');
assert.ok(Number.isFinite(graph.layout.radius) && graph.layout.radius > 0);
for (const node of graph.nodes) {
  assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y), `Finite position: ${node.id}`);
}
// Catch collapsed or overlapping layouts, without prescribing a geometric shape.
for (let i = 0; i < graph.nodes.length; i++) {
  for (let j = i + 1; j < graph.nodes.length; j++) {
    const a = graph.nodes[i], b = graph.nodes[j];
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > 18, `Nodes overlap: ${a.id}, ${b.id}`);
  }
}
assert.ok(graph.links.some(link => link.relation === 'reference'), 'Preserve real article references');

assert.equal(graph.stats.articles, articleIds.size, 'Article statistics must match graph data');
assert.equal(graph.stats.keywords, graph.nodes.filter(node => node.kind === 'keyword').length, 'Keyword statistics must match graph data');
assert.equal(graph.stats.keywordLinks, graph.links.filter(link => link.relation === 'keyword').length, 'Keyword edge statistics must match graph data');

console.log(`PASS knowledge graph auto-build: ${articleIds.size} articles, ${graph.nodes.length} nodes, ${graph.links.length} links, force-directed layout, layout v${graph.layout.version}`);

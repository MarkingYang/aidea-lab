import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { pathToFileURL, fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = path.dirname(fileURLToPath(import.meta.url));
const dependencyRoot = process.env.STUDY_JS_DEPS || here;
const require = createRequire(path.join(dependencyRoot, "package.json"));
const { build } = require("esbuild");
const roots = process.env.STUDY_SOURCE_ROOT || path.join(here, ".sources");
const inputs = JSON.parse(await fs.readFile(path.join(here, "lab-sources.json"), "utf8"));
for (const source of inputs) {
  const file = path.join(roots, source.project + "-files", source.path);
  try { await fs.access(file); }
  catch {
    const response = await fetch(source.url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`${response.status}: ${source.url}`);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
  }
  const { createHash } = await import("node:crypto");
  const actual = createHash("sha256").update(await fs.readFile(file)).digest("hex");
  if (actual !== source.sha256) throw new Error(`Source hash mismatch: ${source.path}`);
}
const temp = await fs.mkdtemp(path.join(os.tmpdir(), "harness-context-lab-"));
try {
  const outfile = path.join(temp, "cases.mjs");
  const kimiRoot = path.join(roots, "kimi-code-files/packages/agent-core-v2/src");
  const bundle = await build({ metafile: true, entryPoints: [path.join(here, "cases.ts")], outfile, bundle: true, format: "esm", platform: "node", target: "node24",
    nodePaths: [path.join(dependencyRoot, "node_modules")], logLevel: "warning",
    plugins: [{ name: "locked-project-source", setup(build) {
      build.onResolve({ filter: /^(kimi\/|opencode\/|#\/|#human\/)/ }, ({ path: spec }) => {
        let resolved;
        if (spec.startsWith("kimi/")) resolved = path.join(kimiRoot, spec.slice(5));
        else if (spec.startsWith("opencode/")) resolved = path.join(roots, "opencode-files", spec.slice(9));
        else if (spec.startsWith("#human/")) resolved = path.join(kimiRoot, "human", spec.slice(7));
        else resolved = path.join(kimiRoot, spec.slice(2));
        return { path: resolved.endsWith(".ts") ? resolved : resolved + ".ts" };
      });
    }}] });
  const verified = new Set(inputs.map(source => path.resolve(roots, source.project + "-files", source.path)));
  for (const input of Object.keys(bundle.metafile.inputs)) {
    const resolved = path.resolve(input);
    if (["kimi-code-files", "opencode-files"].some(project => resolved.startsWith(path.resolve(roots, project) + path.sep)) && !verified.has(resolved)) {
      throw new Error(`Unverified bundled project source: ${resolved}`);
    }
  }
  const { runCases } = await import(pathToFileURL(outfile).href);
  const cases = await runCases();
  const result = { node: process.version, effect: "4.0.0-beta.83", case_count: Object.keys(cases).length,
    cases, limitations: ["Original source modules bundled, not full application startup", "Tool executor is a deterministic test double", "No model requests, server restart, or external side effects", "OpenCode coordinator is a core module; not proof all client routes use it"] };
  await fs.writeFile(path.join(here, "results.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
} finally { await fs.rm(temp, { recursive: true, force: true }); }

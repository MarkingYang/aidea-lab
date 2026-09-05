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
assert.equal(graph.layout?.type, 'clustered-circle-packing', 'The global graph must use hierarchical circle packing');
assert.ok(Number.isFinite(graph.layout?.radius) && graph.layout.radius > 0, 'The graph layout must declare a valid radius');
assert.ok(Array.isArray(graph.layout?.clusters) && graph.layout.clusters.length >= graph.stats.series, 'The layout must expose its local knowledge circles');

for (const node of graph.nodes) {
  assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y), `Node ${node.id} must have a build-time position`);
  assert.ok(Math.hypot(node.x, node.y) <= graph.layout.radius + .001, `Node ${node.id} must stay inside the global circle`);
  assert.ok(node.clusterId, `Node ${node.id} must belong to one local circle`);
}

const clusterById = new Map(graph.layout.clusters.map(cluster => [cluster.id, cluster]));
for (const cluster of graph.layout.clusters) {
  const members = graph.nodes.filter(node => node.clusterId === cluster.id);
  const hub = graph.nodes.find(node => node.id === cluster.hubId);
  assert.equal(members.length, cluster.nodeCount, `Cluster ${cluster.id} must report its actual node count`);
  assert.ok(members.every(node => Math.hypot(node.x - cluster.x, node.y - cluster.y) <= cluster.radius + .001), `Cluster ${cluster.id} must contain its nodes`);
  assert.ok(hub && Math.hypot(hub.x - cluster.x, hub.y - cluster.y) <= .001, `Cluster ${cluster.id} must keep its semantic hub at the center`);
}

for (let first = 0; first < graph.layout.clusters.length; first++) {
  for (let second = first + 1; second < graph.layout.clusters.length; second++) {
    const a = graph.layout.clusters[first];
    const b = graph.layout.clusters[second];
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) + .001 >= a.radius + b.radius, `Local circles ${a.id} and ${b.id} must not overlap`);
  }
}
const centered = graph.layout.clusters.filter(cluster => Math.hypot(cluster.x, cluster.y) < .001);
assert.equal(centered.length, 1, 'Exactly one high-connectivity circle must anchor the center');
for (const cluster of graph.layout.clusters.filter(cluster => !centered.includes(cluster))) {
  assert.ok(Math.abs(Math.hypot(cluster.x, cluster.y) + cluster.radius - (graph.layout.radius - 7)) < .01, `Outer circle ${cluster.id} must contribute to the global envelope`);
}

const lengths = { local: [], cross: [] };
for (const link of graph.links) {
  const source = graph.nodes.find(node => node.id === link.source);
  const target = graph.nodes.find(node => node.id === link.target);
  const distance = Math.hypot(source.x - target.x, source.y - target.y);
  lengths[source.clusterId === target.clusterId ? 'local' : 'cross'].push(distance);
}
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
assert.ok(mean(lengths.local) < mean(lengths.cross), 'Relations inside a knowledge circle must be spatially closer than cross-circle relations');
assert.ok(graph.nodes.every(node => clusterById.has(node.clusterId)), 'Every node must reference a declared circle');

assert.equal(graph.stats.articles, articleIds.size, 'Article statistics must match graph data');
assert.equal(graph.stats.keywords, graph.nodes.filter(node => node.kind === 'keyword').length, 'Keyword statistics must match graph data');
assert.equal(graph.stats.keywordLinks, graph.links.filter(link => link.relation === 'keyword').length, 'Keyword edge statistics must match graph data');

console.log(`PASS knowledge graph auto-build: ${articleIds.size} articles, ${graph.nodes.length} nodes, ${graph.links.length} links, ${graph.layout.clusters.length} local circles inside one global circle, layout v${graph.layout.version}`);

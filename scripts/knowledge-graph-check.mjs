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
const redirectsForArticles = new Set(Object.keys(JSON.parse(fs.readFileSync('src/data/content-redirects.json','utf8'))).filter(url=>url.startsWith('/writing/')).map(url=>url.split('/')[2]));
const builtArticleIds = new Set(
  fs.readdirSync(path.join(outputRoot, 'writing'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(outputRoot, 'writing', entry.name, 'index.html')))
    .map(entry => entry.name)
    .filter(id => !redirectsForArticles.has(id)),
);

assert.equal(nodeIds.size, graph.nodes.length, 'Graph node ids must be unique');
assert.deepEqual([...articleIds].sort(), [...builtArticleIds].sort(), 'Every built article must have exactly one graph node');
assert.ok(graph.links.every(link => nodeIds.has(link.source) && nodeIds.has(link.target)), 'Every graph edge must point to existing nodes');

const registry = JSON.parse(fs.readFileSync('src/data/knowledge.json', 'utf8'));
const redirects = JSON.parse(fs.readFileSync('src/data/content-redirects.json', 'utf8'));
const maintainedSeries = new Map(registry.series.map(item => [item.id, item.articles]));
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
for (const item of registry.series) {
  assert.ok(graph.links.some(link => link.source === `topic:${item.topic}` && link.target === `series:${item.id}` && link.relation === 'topic'), `${item.id}: correct domain parent`);
}
for (const [from, to] of Object.entries(redirects)) {
  const oldId = from.startsWith('/writing/') ? from.split('/')[2] : from.startsWith('/series/') ? `series:${from.split('/')[2]}` : `topic:${from.split('/')[2]}`;
  assert.ok(!nodeIds.has(oldId), `Retired node must not remain: ${oldId}`);
  assert.ok(fs.existsSync(path.join(outputRoot, from, 'index.html')), `Legacy route must still resolve: ${from}`);
  const redirectHtml = fs.readFileSync(path.join(outputRoot, from, 'index.html'), 'utf8');
  assert.ok(redirectHtml.includes(to), `Legacy route points to canonical destination: ${from}`);
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

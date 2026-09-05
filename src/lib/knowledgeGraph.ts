import { getKnowledge, topics, articleHref, type Writing } from './knowledge';

export type GraphNodeKind = 'topic' | 'series' | 'keyword' | 'article';
export type GraphRelation = 'topic' | 'series' | 'keyword' | 'reference' | 'similarity';

export interface KnowledgeGraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  title: string;
  description: string;
  href: string;
  topicId: string;
  seriesId?: string;
  chapter?: number;
  readingTime?: string;
  publishedAt?: string;
  tags: string[];
  degree: number;
  clusterId?: string;
  x?: number;
  y?: number;
  labelSide?: 'left' | 'right';
}

export interface KnowledgeGraphLink {
  id: string;
  source: string;
  target: string;
  relation: GraphRelation;
  label: string;
  reasons: string[];
  weight: number;
  directed: boolean;
}

export interface RelatedArticle {
  id: string;
  title: string;
  description: string;
  href: string;
  relation: GraphRelation;
  relationLabel: string;
  reasons: string[];
  weight: number;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
  stats: {
    articles: number;
    topics: number;
    series: number;
    keywords: number;
    keywordLinks: number;
    references: number;
    similarities: number;
  };
  layout: {
    type: 'clustered-circle-packing';
    radius: number;
    version: number;
    clusters: Array<{
      id: string;
      label: string;
      topicId: string;
      hubId: string;
      x: number;
      y: number;
      radius: number;
      nodeCount: number;
    }>;
    bridges: Array<{
      id: string;
      source: string;
      target: string;
      sourceClusterId: string;
      targetClusterId: string;
      count: number;
      weight: number;
      relations: GraphRelation[];
    }>;
  };
  generatedAt: string;
}

const relationLabels: Record<GraphRelation, string> = {
  topic: '主题归属',
  series: '系列归属',
  keyword: '关键词关联',
  reference: '正文引用',
  similarity: '共享标签',
};

const writingLink = /\]\(\/writing\/([a-z0-9-]+)\/?(?:#[^)]+)?\)/g;
const genericTags = new Set(['AI', 'AI Agent', 'Agent', 'LLM', '产品', '产品思考', '行业观察']);

function pairKey(a: string, b: string) {
  return [a, b].sort().join('::');
}

function primaryTopic(entry: Writing, ids: string[]) {
  if (ids.length) return ids[0];
  const direct = topics.find(topic => topic.tags.some(tag => entry.data.topics.includes(tag)));
  return direct?.id ?? 'perspectives';
}

function similarityScore(a: Writing, b: Writing, tagFrequency: Map<string, number>) {
  const shared = a.data.topics.filter(tag => b.data.topics.includes(tag) && !genericTags.has(tag));
  const score = shared.reduce((sum, tag) => sum + 1 / Math.log2((tagFrequency.get(tag) ?? 1) + 1), 0);
  return { shared, score };
}

function hashUnit(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return (result >>> 0) / 4294967295;
}

function graphEdgeWeight(relation: GraphRelation) {
  if (relation === 'topic') return 3.4;
  if (relation === 'series') return 2.8;
  if (relation === 'reference') return 1.35;
  if (relation === 'keyword') return .48;
  return .72;
}

function assignCirclePackingLayout(nodes: KnowledgeGraphNode[], links: KnowledgeGraphLink[]) {
  const graphRadius = 210;
  const nodeById = new Map(nodes.map(node => [node.id, node]));
  const clusterForNode = new Map<string, string>();
  const clusterDefinitions = new Map<string, { id: string; label: string; topicId: string; hubId: string }>();

  for (const topic of topics) {
    const id = `cluster:topic:${topic.id}`;
    clusterDefinitions.set(id, { id, label: topic.title, topicId: topic.id, hubId: `topic:${topic.id}` });
  }
  for (const node of nodes.filter(node => node.kind === 'series')) {
    const id = `cluster:series:${node.seriesId}`;
    clusterDefinitions.set(id, { id, label: node.title, topicId: node.topicId, hubId: node.id });
  }

  for (const node of nodes) {
    if (node.kind === 'keyword') continue;
    const clusterId = node.kind === 'series' || node.seriesId
      ? `cluster:series:${node.seriesId}`
      : `cluster:topic:${node.topicId}`;
    clusterForNode.set(node.id, clusterId);
  }

  // A keyword joins the community containing most of the articles that use it.
  // This turns editorial metadata into spatial proximity without inventing edges.
  for (const keyword of nodes.filter(node => node.kind === 'keyword')) {
    const candidates = new Map<string, number>();
    for (const link of links) {
      if (link.source !== keyword.id && link.target !== keyword.id) continue;
      const neighborId = link.source === keyword.id ? link.target : link.source;
      const clusterId = clusterForNode.get(neighborId);
      if (clusterId) candidates.set(clusterId, (candidates.get(clusterId) ?? 0) + link.weight);
    }
    const clusterId = [...candidates]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))[0]?.[0]
      ?? `cluster:topic:${keyword.topicId}`;
    clusterForNode.set(keyword.id, clusterId);
  }

  const membersByCluster = new Map<string, KnowledgeGraphNode[]>();
  for (const node of nodes) {
    const clusterId = clusterForNode.get(node.id) ?? `cluster:topic:${node.topicId}`;
    node.clusterId = clusterId;
    membersByCluster.set(clusterId, [...(membersByCluster.get(clusterId) ?? []), node]);
  }

  type Circle = {
    id: string;
    label: string;
    topicId: string;
    hubId: string;
    members: KnowledgeGraphNode[];
    local: Map<string, { x: number; y: number }>;
    radius: number;
    x: number;
    y: number;
  };
  const circles: Circle[] = [...clusterDefinitions.values()]
    .map(definition => ({
      ...definition,
      members: membersByCluster.get(definition.id) ?? [],
      local: new Map(),
      radius: 8,
      x: 0,
      y: 0,
    }))
    .filter(circle => circle.members.length)
    .sort((a, b) => b.members.length - a.members.length || a.id.localeCompare(b.id, 'zh-CN'));

  // Each community is a small circular system. Its semantic hub stays at the
  // center while articles and keywords occupy deterministic concentric rings.
  for (const circle of circles) {
    circle.local.set(circle.hubId, { x: 0, y: 0 });
    const members = circle.members
      .filter(node => node.id !== circle.hubId)
      .sort((a, b) => {
        const kindOrder = { article: 0, keyword: 1, series: 2, topic: 3 };
        return kindOrder[a.kind] - kindOrder[b.kind]
          || (a.chapter ?? 999) - (b.chapter ?? 999)
          || b.degree - a.degree
          || a.id.localeCompare(b.id, 'zh-CN');
      });
    let cursor = 0;
    let ring = 0;
    const phase = hashUnit(`${circle.id}:phase`) * Math.PI * 2;
    while (cursor < members.length) {
      const capacity = 7 + ring * 5;
      const ringMembers = members.slice(cursor, cursor + capacity);
      const radius = 17 + ring * 14;
      ringMembers.forEach((node, index) => {
        const angle = phase + Math.PI * 2 * index / ringMembers.length + ring * .21;
        circle.local.set(node.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
      });
      circle.radius = radius + 8;
      cursor += ringMembers.length;
      ring++;
    }
  }

  const metaEdgeWeights = new Map<string, number>();
  for (const link of links) {
    const sourceCluster = clusterForNode.get(link.source);
    const targetCluster = clusterForNode.get(link.target);
    if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) continue;
    const id = pairKey(sourceCluster, targetCluster);
    metaEdgeWeights.set(id, (metaEdgeWeights.get(id) ?? 0) + graphEdgeWeight(link.relation));
  }
  const circleWeight = (circle: Circle) => {
    let weight = 0;
    for (const [id, edgeWeight] of metaEdgeWeights) {
      const [source, target] = id.split('::');
      if (source === circle.id || target === circle.id) weight += edgeWeight;
    }
    return weight;
  };
  const centerCircle = [...circles].sort((a, b) => circleWeight(b) - circleWeight(a) || b.members.length - a.members.length || a.id.localeCompare(b.id, 'zh-CN'))[0];
  centerCircle.x = 0;
  centerCircle.y = 0;

  // The remaining local circles form one stable global ring. Topic order keeps
  // adjacent knowledge together, while radius-weighted arc lengths prevent large
  // communities from colliding with their neighbors.
  const outerCircles = circles
    .filter(circle => circle !== centerCircle)
    .sort((a, b) => {
      const topicOrder = topics.findIndex(topic => topic.id === a.topicId) - topics.findIndex(topic => topic.id === b.topicId);
      return topicOrder || circleWeight(b) - circleWeight(a) || b.members.length - a.members.length || a.id.localeCompare(b.id, 'zh-CN');
    });
  const arcWeights = outerCircles.map(circle => Math.pow(circle.radius, .82));
  const totalArcWeight = arcWeights.reduce((sum, weight) => sum + weight, 0) || 1;
  let angleCursor = -Math.PI / 2;
  outerCircles.forEach((circle, index) => {
    const span = Math.PI * 2 * arcWeights[index] / totalArcWeight;
    const angle = angleCursor + span / 2;
    const orbit = graphRadius - circle.radius - 7;
    circle.x = Math.cos(angle) * orbit;
    circle.y = Math.sin(angle) * orbit;
    angleCursor += span;
  });

  const scale = 1;
  for (const circle of circles) {
    circle.x *= scale;
    circle.y *= scale;
    circle.radius *= scale;
    for (const node of circle.members) {
      const local = circle.local.get(node.id) ?? { x: 0, y: 0 };
      const x = circle.x + local.x * scale;
      const y = circle.y + local.y * scale;
      node.x = Number(x.toFixed(4));
      node.y = Number(y.toFixed(4));
      node.labelSide = x < circle.x ? 'left' : 'right';
    }
  }

  if (nodes.some(node => !Number.isFinite(node.x) || !Number.isFinite(node.y))) throw new Error('Knowledge graph layout contains an invalid position');
  const clusterById = new Map(circles.map(circle => [circle.id, circle]));
  const bridgeCandidates = new Map<string, {
    sourceClusterId: string;
    targetClusterId: string;
    count: number;
    weight: number;
    relations: Set<GraphRelation>;
  }>();
  for (const link of links) {
    const sourceClusterId = clusterForNode.get(link.source);
    const targetClusterId = clusterForNode.get(link.target);
    if (!sourceClusterId || !targetClusterId || sourceClusterId === targetClusterId) continue;
    const [source, target] = [sourceClusterId, targetClusterId].sort();
    const id = pairKey(source, target);
    const candidate = bridgeCandidates.get(id) ?? {
      sourceClusterId: source,
      targetClusterId: target,
      count: 0,
      weight: 0,
      relations: new Set<GraphRelation>(),
    };
    candidate.count++;
    candidate.weight += graphEdgeWeight(link.relation);
    candidate.relations.add(link.relation);
    bridgeCandidates.set(id, candidate);
  }

  // Cross-community evidence can contain dozens of article-level links. The
  // overview uses their maximum-weight spanning forest as a quiet relationship
  // skeleton; interaction still reveals every original edge.
  const parent = new Map(circles.map(circle => [circle.id, circle.id]));
  const find = (id: string): string => {
    const current = parent.get(id) ?? id;
    if (current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };
  const bridges = [...bridgeCandidates.entries()]
    .sort((a, b) => b[1].weight - a[1].weight || b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .flatMap(([id, candidate]) => {
      const sourceRoot = find(candidate.sourceClusterId);
      const targetRoot = find(candidate.targetClusterId);
      if (sourceRoot === targetRoot) return [];
      parent.set(targetRoot, sourceRoot);
      const sourceCircle = clusterById.get(candidate.sourceClusterId);
      const targetCircle = clusterById.get(candidate.targetClusterId);
      if (!sourceCircle || !targetCircle) return [];
      return [{
        id: `bridge:${id}`,
        source: sourceCircle.hubId,
        target: targetCircle.hubId,
        sourceClusterId: candidate.sourceClusterId,
        targetClusterId: candidate.targetClusterId,
        count: candidate.count,
        weight: Number(candidate.weight.toFixed(2)),
        relations: [...candidate.relations].sort(),
      }];
    });

  return {
    radius: graphRadius,
    clusters: circles.map(circle => ({
      id: circle.id,
      label: circle.label,
      topicId: circle.topicId,
      hubId: circle.hubId,
      x: Number(circle.x.toFixed(4)),
      y: Number(circle.y.toFixed(4)),
      radius: Number(circle.radius.toFixed(4)),
      nodeCount: circle.members.length,
    })),
    bridges,
  };
}

let graphPromise: Promise<KnowledgeGraphData> | undefined;

async function createKnowledgeGraph(): Promise<KnowledgeGraphData> {
  const { entries, series, seriesByArticle, topicIdsFor } = await getKnowledge();
  const entryById = new Map(entries.map(entry => [entry.id, entry]));
  const nodes: KnowledgeGraphNode[] = [];
  const links: KnowledgeGraphLink[] = [];
  const linkIds = new Set<string>();

  const addLink = (link: Omit<KnowledgeGraphLink, 'id'>) => {
    const id = `${link.relation}:${link.directed ? `${link.source}>${link.target}` : pairKey(link.source, link.target)}`;
    if (link.source === link.target || linkIds.has(id)) return;
    linkIds.add(id);
    links.push({ ...link, id });
  };

  for (const topic of topics) {
    nodes.push({
      id: `topic:${topic.id}`,
      kind: 'topic',
      label: topic.title,
      title: topic.title,
      description: topic.question,
      href: `/topics/${topic.id}/`,
      topicId: topic.id,
      tags: topic.tags,
      degree: 0,
    });
  }

  for (const item of series) {
    nodes.push({
      id: `series:${item.id}`,
      kind: 'series',
      label: item.title,
      title: item.title,
      description: item.description,
      href: `/series/${item.id}/`,
      topicId: item.topic,
      seriesId: item.id,
      tags: [],
      degree: 0,
    });
    addLink({
      source: `topic:${item.topic}`,
      target: `series:${item.id}`,
      relation: 'topic',
      label: relationLabels.topic,
      reasons: [topics.find(topic => topic.id === item.topic)?.title ?? item.topic],
      weight: 4,
      directed: false,
    });
  }

  for (const entry of entries) {
    const parent = seriesByArticle.get(entry.id);
    const topicId = parent?.topic ?? primaryTopic(entry, topicIdsFor(entry));
    const chapter = parent?.articles.findIndex(article => article.id === entry.id);
    nodes.push({
      id: entry.id,
      kind: 'article',
      label: entry.data.title,
      title: entry.data.title,
      description: entry.data.description,
      href: articleHref(entry.id),
      topicId,
      seriesId: parent?.id,
      chapter: chapter === undefined || chapter < 0 ? undefined : chapter + 1,
      readingTime: entry.data.readingTime,
      publishedAt: entry.data.publishedAt.toISOString(),
      tags: entry.data.topics,
      degree: 0,
    });

    if (parent) {
      addLink({
        source: `series:${parent.id}`,
        target: entry.id,
        relation: 'series',
        label: relationLabels.series,
        reasons: [`${parent.title} · 第 ${(chapter ?? 0) + 1} 篇`],
        weight: 3,
        directed: false,
      });
    } else {
      addLink({
        source: `topic:${topicId}`,
        target: entry.id,
        relation: 'topic',
        label: relationLabels.topic,
        reasons: [topics.find(topic => topic.id === topicId)?.title ?? topicId],
        weight: 2.5,
        directed: false,
      });
    }
  }

  const tagFrequency = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.data.topics) tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
  }

  // Repeated, descriptive tags are first-class wayfinding nodes. This keeps the
  // reader-facing graph richer than a series directory without importing code,
  // assets, or one-off metadata from the Obsidian vault.
  const keywordTags = [...tagFrequency]
    .filter(([tag, count]) => count >= 2 && !genericTags.has(tag))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
  const entryTopic = new Map(entries.map(entry => {
    const parent = seriesByArticle.get(entry.id);
    return [entry.id, parent?.topic ?? primaryTopic(entry, topicIdsFor(entry))] as const;
  }));

  for (const [tag, count] of keywordTags) {
    const topicCounts = new Map<string, number>();
    for (const entry of entries) {
      if (!entry.data.topics.includes(tag)) continue;
      const topicId = entryTopic.get(entry.id) ?? 'perspectives';
      topicCounts.set(topicId, (topicCounts.get(topicId) ?? 0) + 1);
    }
    const topicId = [...topicCounts].sort((a, b) => b[1] - a[1] || topics.findIndex(topic => topic.id === a[0]) - topics.findIndex(topic => topic.id === b[0]))[0]?.[0] ?? 'perspectives';
    const id = `keyword:${tag}`;
    nodes.push({
      id,
      kind: 'keyword',
      label: tag,
      title: tag,
      description: `${count} 篇文章共同使用这个关键词。`,
      href: `/library/?tag=${encodeURIComponent(tag)}`,
      topicId,
      tags: [tag],
      degree: 0,
    });
    for (const entry of entries) {
      if (!entry.data.topics.includes(tag)) continue;
      addLink({
        source: id,
        target: entry.id,
        relation: 'keyword',
        label: relationLabels.keyword,
        reasons: [tag],
        weight: Number((1.1 + 1 / Math.sqrt(count)).toFixed(2)),
        directed: false,
      });
    }
  }

  const explicitPairs = new Set<string>();
  for (const entry of entries) {
    const sourceSeries = seriesByArticle.get(entry.id)?.id;
    for (const match of entry.body?.matchAll(writingLink) ?? []) {
      const target = match[1];
      if (!entryById.has(target) || target === entry.id) continue;
      const targetSeries = seriesByArticle.get(target)?.id;
      // The first block of each series chapter repeats the complete series index.
      // Series membership already carries that structure, so suppress those cliques.
      if (sourceSeries && sourceSeries === targetSeries) continue;
      explicitPairs.add(pairKey(entry.id, target));
      addLink({
        source: entry.id,
        target,
        relation: 'reference',
        label: relationLabels.reference,
        reasons: ['正文中直接引用'],
        weight: 2.4,
        directed: true,
      });
    }
  }

  const candidates = new Map<string, Array<{ target: Writing; shared: string[]; score: number }>>();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      if (seriesByArticle.get(a.id)?.id && seriesByArticle.get(a.id)?.id === seriesByArticle.get(b.id)?.id) continue;
      if (explicitPairs.has(pairKey(a.id, b.id))) continue;
      const { shared, score } = similarityScore(a, b, tagFrequency);
      if (!shared.length || score < 0.42) continue;
      candidates.set(a.id, [...(candidates.get(a.id) ?? []), { target: b, shared, score }]);
      candidates.set(b.id, [...(candidates.get(b.id) ?? []), { target: a, shared, score }]);
    }
  }

  const selectedSimilarityPairs = new Map<string, { source: string; target: string; shared: string[]; score: number }>();
  for (const [source, list] of candidates) {
    for (const candidate of list.sort((a, b) => b.score - a.score || a.target.id.localeCompare(b.target.id)).slice(0, 2)) {
      const key = pairKey(source, candidate.target.id);
      const existing = selectedSimilarityPairs.get(key);
      if (!existing || candidate.score > existing.score) {
        selectedSimilarityPairs.set(key, { source, target: candidate.target.id, shared: candidate.shared, score: candidate.score });
      }
    }
  }

  for (const candidate of selectedSimilarityPairs.values()) {
    addLink({
      source: candidate.source,
      target: candidate.target,
      relation: 'similarity',
      label: relationLabels.similarity,
      reasons: candidate.shared.slice(0, 3),
      weight: Number((1 + Math.min(candidate.score, 1.6)).toFixed(2)),
      directed: false,
    });
  }

  const degrees = new Map<string, number>();
  for (const link of links) {
    degrees.set(link.source, (degrees.get(link.source) ?? 0) + 1);
    degrees.set(link.target, (degrees.get(link.target) ?? 0) + 1);
  }
  for (const node of nodes) node.degree = degrees.get(node.id) ?? 0;

  const packedLayout = assignCirclePackingLayout(nodes, links);

  const nodeIds = new Set(nodes.map(node => node.id));
  if (nodeIds.size !== nodes.length) throw new Error('Duplicate knowledge graph node id');
  if (links.some(link => !nodeIds.has(link.source) || !nodeIds.has(link.target))) throw new Error('Knowledge graph link points to a missing node');
  if (nodes.filter(node => node.kind === 'article').some(node => node.degree === 0)) throw new Error('Every article must be connected to the knowledge graph');

  return {
    nodes,
    links,
    stats: {
      articles: entries.length,
      topics: topics.length,
      series: series.length,
      keywords: keywordTags.length,
      keywordLinks: links.filter(link => link.relation === 'keyword').length,
      references: links.filter(link => link.relation === 'reference').length,
      similarities: links.filter(link => link.relation === 'similarity').length,
    },
    layout: {
      type: 'clustered-circle-packing',
      radius: packedLayout.radius,
      clusters: packedLayout.clusters,
      bridges: packedLayout.bridges,
      version: 4,
    },
    generatedAt: new Date().toISOString(),
  };
}

export function getKnowledgeGraph() {
  if (import.meta.env.DEV) return createKnowledgeGraph();
  graphPromise ??= createKnowledgeGraph();
  return graphPromise;
}

export function getRelatedArticles(graph: KnowledgeGraphData, articleId: string, limit = 4): RelatedArticle[] {
  const nodes = new Map(graph.nodes.map(node => [node.id, node]));
  const relationPriority: Record<GraphRelation, number> = { reference: 5, similarity: 4, keyword: 3, series: 2, topic: 1 };
  const current = nodes.get(articleId);
  const related = graph.links
    .filter(link => link.source === articleId || link.target === articleId)
    .map(link => {
      const otherId = link.source === articleId ? link.target : link.source;
      const node = nodes.get(otherId);
      if (!node || node.kind !== 'article') return null;
      return {
        id: node.id,
        title: node.title,
        description: node.description,
        href: node.href,
        relation: link.relation,
        relationLabel: relationLabels[link.relation],
        reasons: link.reasons,
        weight: link.weight,
      } satisfies RelatedArticle;
    })
    .filter((item): item is RelatedArticle => item !== null);

  if (current?.seriesId) {
    for (const node of graph.nodes) {
      if (node.kind !== 'article' || node.id === articleId || node.seriesId !== current.seriesId) continue;
      const distance = Math.abs((node.chapter ?? 0) - (current.chapter ?? 0));
      if (distance > 1) continue;
      related.push({
        id: node.id,
        title: node.title,
        description: node.description,
        href: node.href,
        relation: 'series',
        relationLabel: relationLabels.series,
        reasons: [`同系列 · 第 ${node.chapter} 篇`],
        weight: 2.8 - distance * .1,
      });
    }
  }

  const unique = new Map<string, RelatedArticle>();
  for (const item of related) {
    const existing = unique.get(item.id);
    if (!existing || relationPriority[item.relation] > relationPriority[existing.relation] || item.weight > existing.weight) unique.set(item.id, item);
  }

  return [...unique.values()]
    .sort((a, b) => relationPriority[b.relation] - relationPriority[a.relation] || b.weight - a.weight || a.title.localeCompare(b.title, 'zh-CN'))
    .slice(0, limit);
}

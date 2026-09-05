import { createGraphSimulation } from './graphSimulation';
import { getKnowledge, topics, articleHref, type Writing } from './knowledge';
import contentRedirects from '../data/content-redirects.json';

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
  aliases: Record<string, string>;
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
    type: 'force-directed';
    radius: number;
    version: number;
  };
  generatedAt: string;
}

const relationLabels: Record<GraphRelation, string> = {
  topic: '知识域归属',
  series: '专题归属',
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

function assignForceLayout(nodes: KnowledgeGraphNode[], links: KnowledgeGraphLink[]) {
  for (const node of nodes) {
    node.clusterId = node.seriesId ? `series:${node.seriesId}` : `topic:${node.topicId}`;
    node.labelSide = 'right';
  }
  const simulation = createGraphSimulation(nodes, links);
  simulation.tick(400);
  simulation.stop();
  const minX = Math.min(...nodes.map(node => node.x!));
  const maxX = Math.max(...nodes.map(node => node.x!));
  const minY = Math.min(...nodes.map(node => node.y!));
  const maxY = Math.max(...nodes.map(node => node.y!));
  for (const node of nodes) {
    node.x = Number((node.x! - (minX + maxX) / 2).toFixed(4));
    node.y = Number((node.y! - (minY + maxY) / 2).toFixed(4));
  }
  return { radius: Math.max(...nodes.map(node => Math.hypot(node.x!, node.y!))) + 24 };
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
      directed: true,
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
        directed: true,
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
    const body = (entry.body ?? '').replace(/^>[^\n]*(?:系列|篇目|目录)[^\n]*$/gm, '');
    for (const match of body.matchAll(writingLink)) {
      const target = match[1];
      if (!entryById.has(target) || target === entry.id) continue;
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

  const packedLayout = assignForceLayout(nodes, links);

  const nodeIds = new Set(nodes.map(node => node.id));
  if (nodeIds.size !== nodes.length) throw new Error('Duplicate knowledge graph node id');
  if (links.some(link => !nodeIds.has(link.source) || !nodeIds.has(link.target))) throw new Error('Knowledge graph link points to a missing node');
  if (nodes.filter(node => node.kind === 'article').some(node => node.degree === 0)) throw new Error('Every article must be connected to the knowledge graph');

  return {
    nodes,
    links,
    aliases: Object.fromEntries(Object.entries(contentRedirects).map(([from, to]) => {
      const nodeId = (url: string) => {
        const [, kind, id] = url.split('/');
        return kind === 'writing' ? id : `${kind === 'topics' ? 'topic' : 'series'}:${id}`;
      };
      return [nodeId(from), nodeId(to)];
    })),
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
      type: 'force-directed',
      radius: packedLayout.radius,
      version: 7,
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

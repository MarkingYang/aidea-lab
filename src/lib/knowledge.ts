import { getCollection, type CollectionEntry } from 'astro:content';
import registry from '../data/knowledge.json';

export const topics = registry.topics;
export const seriesDefinitions = registry.series;
export type Writing = CollectionEntry<'writing'>;
export const articleHref = (id: string) => `/writing/${id}/`;
export const shortTitle = (title: string) => title.replace(/^.+?[（(][一二三四五六七八九十\d]+[）)]\s*[：:]\s*/, '');
export const dateLabel = (date: Date) => date.toISOString().slice(0, 10).replaceAll('-', '.');
export const updated = (entry: Writing) => entry.data.updatedAt ?? entry.data.publishedAt;
export const byRecent = (a: Writing, b: Writing) => updated(b).valueOf() - updated(a).valueOf() || b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf() || a.id.localeCompare(b.id);
export const stageLabel = (index: number, length: number) => length === 1 ? '独立阅读' : `专题文章 ${index + 1} / ${length}`;

export async function getKnowledge() {
  if(new Set(topics.map(item=>item.id)).size !== topics.length || new Set(seriesDefinitions.map(item=>item.id)).size !== seriesDefinitions.length) throw new Error('Duplicate knowledge directory id');
  const entries = (await getCollection('writing')).sort(byRecent);
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const used = new Set<string>();
  const series = seriesDefinitions.map(definition => {
    if (!topics.some(topic => topic.id === definition.topic)) throw new Error(`Unknown topic: ${definition.topic}`);
    if (!definition.articles.length) throw new Error(`Empty knowledge topic: ${definition.id}`);
    const articles = definition.articles.map(id => {
      const entry = byId.get(id);
      if (!entry) throw new Error(`Missing series article: ${id}`);
      if (used.has(id)) throw new Error(`Article belongs to multiple ordered series: ${id}`);
      used.add(id);
      return entry;
    });
    return { ...definition, articles, updatedAt: new Date(Math.max(...articles.map(entry => updated(entry).valueOf()))), minutes: articles.reduce((sum, entry) => sum + (Number.parseInt(entry.data.readingTime) || 0), 0) };
  });
  const seriesByArticle = new Map(series.flatMap(item => item.articles.map(entry => [entry.id, item] as const)));
  const unclassified = entries.filter(entry => !seriesByArticle.has(entry.id));
  if (unclassified.length) throw new Error(`Articles need a canonical directory home: ${unclassified.map(entry => entry.id).join(', ')}`);
  const topicIdsFor = (entry: Writing) => {
    const parent = seriesByArticle.get(entry.id);
    // Series has one editorial home; standalone observations may cross themes.
    return parent ? [parent.topic] : topics.filter(topic => topic.tags.some(tag => entry.data.topics.includes(tag))).map(topic => topic.id);
  };
  return { entries, series, seriesByArticle, topicIdsFor };
}
export type KnowledgeSeries = Awaited<ReturnType<typeof getKnowledge>>['series'][number];

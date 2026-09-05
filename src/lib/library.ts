export interface LibraryEntry {
  id: string; title: string; description: string; tags: string[]; topics: string[];
  type: string; status: string; series: string; seriesTitle: string; chapter: number;
  published: string; updated: string; minutes: number; readingTime: string;
}
export interface LibraryFilters { q: string; topic: string; tag: string; series: string; scope: string; type: string; sort: string; page: number; }
export const PAGE_SIZE = 12;
export const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase().trim();
export function readFilters(params: URLSearchParams): LibraryFilters {
  return { q: params.get('q') ?? '', topic: params.get('topic') ?? '', tag: params.get('tag') ?? '', series: params.get('series') ?? '', scope: params.get('scope') ?? '', type: params.get('type') ?? '', sort: params.get('sort') ?? 'updated', page: Math.max(1, Math.floor(Number(params.get('page'))) || 1) };
}
export function filterLibrary(entries: LibraryEntry[], filters: LibraryFilters) {
  const terms = normalize(filters.q).split(/\s+/).filter(Boolean);
  return entries.filter(entry => {
    const haystack = normalize([entry.title, entry.description, ...entry.tags, entry.seriesTitle].join(' '));
    return terms.every(term=>haystack.includes(term))
      && (!filters.topic || entry.topics.includes(filters.topic))
      && (!filters.tag || entry.tags.includes(filters.tag))
      && (!filters.series || entry.series === filters.series)
      && (!filters.type || entry.type === filters.type)
      && (filters.scope !== 'standalone' || !entry.series)
      && (filters.scope !== 'series' || !!entry.series);
  }).sort((a,b) => {
    if (filters.series && filters.sort === 'updated') return a.chapter-b.chapter;
    if (filters.sort === 'shortest') return a.minutes-b.minutes || a.id.localeCompare(b.id);
    if (filters.sort === 'title') return a.title.localeCompare(b.title,'zh-CN');
    const field = filters.sort === 'published' ? 'published' : 'updated';
    return b[field].localeCompare(a[field]) || b.published.localeCompare(a.published) || a.id.localeCompare(b.id);
  });
}
export function paginateLibrary(entries: LibraryEntry[], page: number) {
  const pages = Math.max(1,Math.ceil(entries.length/PAGE_SIZE));
  const current = Math.min(pages, Number.isFinite(page) ? Math.max(1,Math.floor(page)) : 1);
  return { entries: entries.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE), pages, current };
}
export function pageWindow(current: number, pages: number) {
  return Array.from(new Set([1, ...Array.from({length:5},(_,i)=>current-2+i).filter(n=>n>0 && n<=pages),pages])).sort((a,b)=>a-b);
}
export function filtersUrl(filters: LibraryFilters) {
  const params = new URLSearchParams();
  for (const key of ['q','topic','tag','series','scope','type'] as const) if(filters[key]) params.set(key,filters[key]);
  if(filters.sort !== 'updated') params.set('sort',filters.sort);
  if(filters.page > 1) params.set('page',String(filters.page));
  return '/library/' + (params.size ? `?${params}` : '');
}

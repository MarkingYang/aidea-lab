export interface UmamiPageMetric {
  path: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totalTime: number;
}

export interface UmamiPopularityResult {
  configured: boolean;
  metrics: Map<string, UmamiPageMetric>;
  periodDays: number;
}

interface UmamiExpandedMetric {
  name?: string;
  pageviews?: number;
  visitors?: number;
  visits?: number;
  bounces?: number;
  totaltime?: number;
}

const PERIOD_DAYS = 30;
let popularityRequest: Promise<UmamiPopularityResult> | undefined;

function normalizePath(value: string) {
  let path = value;

  try {
    path = new URL(value).pathname;
  } catch {
    path = value.split(/[?#]/, 1)[0] ?? value;
  }

  if (!path.startsWith('/')) path = `/${path}`;
  return path === '/' || path.endsWith('/') ? path : `${path}/`;
}

async function requestPopularity(): Promise<UmamiPopularityResult> {
  const websiteId = import.meta.env.PUBLIC_UMAMI_WEBSITE_ID?.trim();
  const token = import.meta.env.UMAMI_API_TOKEN?.trim();
  const apiBase = (import.meta.env.UMAMI_API_URL || 'https://api.umami.is').replace(/\/$/, '');

  if (!websiteId || !token) {
    return { configured: false, metrics: new Map(), periodDays: PERIOD_DAYS };
  }

  const endAt = Date.now();
  const startAt = endAt - PERIOD_DAYS * 24 * 60 * 60 * 1000;
  const endpoint = new URL(`${apiBase}/api/websites/${encodeURIComponent(websiteId)}/metrics/expanded`);
  endpoint.searchParams.set('startAt', String(startAt));
  endpoint.searchParams.set('endAt', String(endAt));
  endpoint.searchParams.set('type', 'path');
  endpoint.searchParams.set('limit', '100');

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Umami API returned ${response.status}`);
    }

    const rows = (await response.json()) as UmamiExpandedMetric[];
    const metrics = new Map<string, UmamiPageMetric>();

    for (const row of rows) {
      if (!row.name) continue;
      const path = normalizePath(row.name);
      if (!path.startsWith('/writing/')) continue;

      const existing = metrics.get(path);
      metrics.set(path, {
        path,
        pageviews: (existing?.pageviews ?? 0) + (row.pageviews ?? 0),
        visitors: (existing?.visitors ?? 0) + (row.visitors ?? 0),
        visits: (existing?.visits ?? 0) + (row.visits ?? 0),
        bounces: (existing?.bounces ?? 0) + (row.bounces ?? 0),
        totalTime: (existing?.totalTime ?? 0) + (row.totaltime ?? 0),
      });
    }

    return { configured: true, metrics, periodDays: PERIOD_DAYS };
  } catch (error) {
    console.warn('[umami] Could not load popularity data. The site will build without a hot list.', error);
    return { configured: true, metrics: new Map(), periodDays: PERIOD_DAYS };
  }
}

export function getUmamiPopularity() {
  popularityRequest ??= requestPopularity();
  return popularityRequest;
}

export function getWritingMetric(metrics: Map<string, UmamiPageMetric>, entryId: string) {
  return metrics.get(`/writing/${entryId}/`);
}

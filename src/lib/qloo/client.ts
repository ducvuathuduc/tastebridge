/**
 * Thin, typed client for the Qloo Insights API (hackathon environment).
 * Server-only: the API key is read from the environment and never sent to the browser.
 * Responses are cached privately in memory (allowed by the hackathon guide) and are
 * never written to the repository.
 */
import "server-only";

export const QLOO_BASE = process.env.QLOO_BASE_URL || "https://hackathon.api.qloo.com";

export class QlooError extends Error {
  constructor(message: string, public status?: number, public path?: string) {
    super(message);
  }
}

type Params = Record<string, string | number | undefined>;

const cache = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 1000 * 60 * 60 * 6;

export async function qlooGet<T = any>(path: string, params: Params): Promise<{ data: T; url: string }> {
  const key = process.env.QLOO_API_KEY;
  if (!key) throw new QlooError("QLOO_API_KEY is not configured on the server");
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") qs.set(k, String(v));
  const url = `${QLOO_BASE}${path}?${qs.toString()}`;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return { data: hit.data as T, url };

  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { "X-Api-Key": key, accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(30_000) });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new QlooError(`Qloo ${res.status}`, res.status, path);
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1) ** 2));
        continue;
      }
      if (!res.ok) throw new QlooError(`Qloo ${res.status}: ${(await res.text()).slice(0, 200)}`, res.status, path);
      const data = (await res.json()) as T;
      cache.set(url, { at: Date.now(), data });
      if (cache.size > 2000) cache.delete(cache.keys().next().value as string);
      return { data, url };
    } catch (e) {
      lastErr = e;
      if (e instanceof QlooError && e.status && e.status < 500 && e.status !== 429) throw e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new QlooError("Qloo request failed");
}

/** Public, key-free version of a Qloo URL for the evidence ledger. */
export function publicUrl(url: string) {
  return url.replace(QLOO_BASE, "qloo:");
}

// ---------- Typed helpers ----------

export interface QTag { id: string; name: string; type: string }
export interface QPlace {
  entity_id: string;
  name: string;
  popularity?: number;
  query?: { affinity?: number; distance?: number };
  location?: { lat: number; lon: number };
  properties?: { address?: string; neighborhood?: string; price_level?: number; business_rating?: number; website?: string };
  tags?: QTag[];
}
export interface QEntity { entity_id: string; name: string; popularity?: number; query?: { affinity?: number }; types?: string[]; subtype?: string; properties?: Record<string, any>; tags?: QTag[] }

export async function searchEntities(query: string, types = "urn:entity:place", take = 10) {
  const { data, url } = await qlooGet<{ results: QEntity[] }>("/search", { query, types, take });
  return { results: data.results || [], url };
}

export async function searchTags(query: string, take = 10) {
  const { data, url } = await qlooGet<any>("/v2/tags", { "filter.query": query, take });
  const tags = (data?.results?.tags || []).filter((t: any) => (t.parents || []).some((p: any) => p.type === "urn:entity:place"));
  return { tags: tags.map((t: any) => ({ id: t.id as string, name: t.name as string, type: t.type as string, popularity: t.popularity as number })), url };
}

export async function getEntities(ids: string[]) {
  const { data, url } = await qlooGet<{ results: QEntity[] }>("/entities", { entity_ids: ids.join(",") });
  return { results: data.results || [], url };
}

export async function placeInsights(opts: { city: string; entities?: string[]; tags?: string[]; filterTags?: string; take?: number }) {
  const { data, url } = await qlooGet<any>("/v2/insights", {
    "filter.type": "urn:entity:place",
    "signal.interests.entities": opts.entities?.join(","),
    "signal.interests.tags": opts.tags?.join(","),
    "filter.location.query": opts.city,
    "filter.tags": opts.filterTags,
    take: opts.take ?? 30,
  });
  return { places: (data?.results?.entities || []) as QPlace[], url, locality: localityName(data) };
}

export async function heatmap(opts: { city: string; entities?: string[]; tags?: string[] }) {
  const { data, url } = await qlooGet<any>("/v2/insights", {
    "filter.type": "urn:heatmap",
    "signal.interests.entities": opts.entities?.join(","),
    "signal.interests.tags": opts.tags?.join(","),
    "filter.location.query": opts.city,
  });
  const cells = (data?.results?.heatmap || []).map((c: any) => ({
    lat: c.location.latitude as number,
    lng: c.location.longitude as number,
    geohash: c.location.geohash as string,
    affinity: c.query?.affinity as number,
    affinityRank: c.query?.affinity_rank as number,
    popularity: c.query?.popularity as number,
  }));
  return { cells, url, locality: localityName(data) };
}

export async function demographics(opts: { entities?: string[]; tags?: string[] }) {
  const { data, url } = await qlooGet<any>("/v2/insights", {
    "filter.type": "urn:demographics",
    "signal.interests.entities": opts.entities?.join(","),
    "signal.interests.tags": opts.tags?.join(","),
  });
  return { rows: (data?.results?.demographics || []) as { entity_id: string; query: { age: Record<string, number>; gender: Record<string, number> } }[], url };
}

export type CrossDomain = "urn:entity:artist" | "urn:entity:movie" | "urn:entity:tv_show" | "urn:entity:person" | "urn:entity:brand" | "urn:entity:podcast";

export async function crossDomain(opts: { type: CrossDomain; city: string; entities?: string[]; take?: number }) {
  const { data, url } = await qlooGet<any>("/v2/insights", {
    "filter.type": opts.type,
    "signal.interests.entities": opts.entities?.join(","),
    "signal.location.query": opts.city,
    take: opts.take ?? 8,
  });
  return { entities: (data?.results?.entities || []) as QEntity[], url };
}

function localityName(data: any): string | undefined {
  const f = data?.query?.localities?.filter ?? data?.query?.localities?.signal;
  if (Array.isArray(f)) return f[0]?.disambiguation || f[0]?.name;
  return f?.disambiguation || f?.name;
}

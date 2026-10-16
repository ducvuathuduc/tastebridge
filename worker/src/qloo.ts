import type { Env } from './env';
import { CATEGORIES, CITY_COORDS } from './catalog';

export class QlooError extends Error {
  code = 'qloo_unavailable';
}

export async function qlooGet(env: Env, path: string, params: Record<string, string | number>) {
  if (!env.QLOO_API_KEY) throw new QlooError('QLOO_API_KEY is not configured on the server');
  const url = new URL((env.QLOO_BASE || 'https://hackathon.api.qloo.com') + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { 'X-Api-Key': env.QLOO_API_KEY, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
  } catch (err: any) {
    throw new QlooError(`Qloo request failed: ${err?.message || err}`);
  }
  if (res.ok) {
    const json = await res.json().catch(() => null);
    if (json === null) throw new QlooError('Qloo returned an unreadable response');
    return json as any;
  }
  if (res.status === 404) return null; // "No results" is a legitimate empty set
  throw new QlooError(`Qloo ${path} responded with status ${res.status}`);
}

export interface TasteEvidence {
  brandFound: boolean;
  matchedName: string | null;
  brandPopularity: number | null;
  brandTags: string[];
  relatedBrands: { name: string; affinity: number | null }[];
  cityPlaces: string[];
  signalIds: string[];
}

/**
 * Faithful port of the original analyzeMarketEntry evidence gathering:
 * /search brand → /search category brands → /v2/insights related brands → /search city places.
 * `brandName` may be empty (plan localisation without a known brand) — category signals are used.
 */
export async function gatherEvidence(env: Env, brandName: string, city: string, category: string): Promise<TasteEvidence> {
  const cat = CATEGORIES[category];
  const brandSearch = brandName
    ? await qlooGet(env, '/search', { query: brandName, types: 'urn:entity:brand', take: 5 })
    : null;
  const brandEntity = (brandSearch?.results || [])[0] || null;

  const catBrandSearch = await qlooGet(env, '/search', { query: cat.brandTerm, types: 'urn:entity:brand', take: 5 });
  const categoryEntities = (catBrandSearch?.results || []).slice(0, 3);

  const signalIds: string[] = brandEntity
    ? [brandEntity.entity_id]
    : categoryEntities.map((e: any) => e.entity_id).filter(Boolean);

  if (signalIds.length === 0) {
    throw new QlooError('No taste data available for this brand or category.');
  }

  const insights = await qlooGet(env, '/v2/insights', {
    'signal.interests.entities': signalIds.join(','),
    'filter.type': 'urn:entity:brand',
    take: 12
  });
  const relatedBrands = ((insights?.results?.entities) || [])
    .filter((e: any) => e && e.name)
    .map((e: any) => ({
      name: String(e.name).slice(0, 80),
      affinity: typeof e.query?.affinity === 'number' ? Math.round(e.query.affinity * 100) / 100 : null
    }))
    .slice(0, 8);

  const placeSearch = await qlooGet(env, '/search', {
    query: cat.placeTerm,
    types: 'urn:entity:place',
    'filter.location': CITY_COORDS[city],
    'filter.radius': 10,
    take: 10,
    sort_by: 'popularity'
  });
  const cityPlaces = (placeSearch?.results || []).map((e: any) => e?.name).filter(Boolean).slice(0, 8);

  const brandTags = (brandEntity?.tags || [])
    .slice(0, 14)
    .map((tag: any) => (typeof tag === 'string' ? tag : tag?.name || tag?.tag || tag?.label || ''))
    .filter(Boolean);

  return {
    brandFound: Boolean(brandEntity),
    matchedName: brandEntity ? brandEntity.name : null,
    brandPopularity: typeof brandEntity?.popularity === 'number' ? brandEntity.popularity : null,
    brandTags,
    relatedBrands,
    cityPlaces,
    signalIds
  };
}

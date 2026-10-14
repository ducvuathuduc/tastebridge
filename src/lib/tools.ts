/**
 * Qloo-backed tools exposed to agents through native function calling.
 * Every tool: (1) calls the real Qloo API, (2) records raw figures into the run's
 * evidence ledger and city state, (3) returns a compact text summary to the model.
 */
import "server-only";
import * as Q from "./qloo/client";
import type { ToolSpec } from "./llm";
import type { BrandProfile, CityData, Evidence, PlaceLite } from "./types";
import type { MarketPack } from "./markets";

export interface RunState {
  pack: MarketPack;
  cityIds: string[];
  profile: BrandProfile;
  seenEntities: Map<string, { name: string; address?: string; popularity?: number }>;
  seenTags: Map<string, string>;
  cities: Record<string, CityData>;
  evidence: Evidence[];
}

export function newState(pack: MarketPack, cityIds: string[], brand: string): RunState {
  const cities: Record<string, CityData> = {};
  for (const id of cityIds) {
    const c = pack.cities.find((x) => x.id === id);
    if (!c) continue;
    cities[id] = { cityId: id, cityName: c.name.en, similar: [], similarAll: 0, analogs: [], heat: [], culture: {}, localTaste: [], priceLevels: {} };
  }
  return { pack, cityIds: Object.keys(cities), profile: { name: brand, anchors: [], tags: [], summary: "" }, seenEntities: new Map(), seenTags: new Map(), cities, evidence: [] };
}

function ev(s: RunState, label: string, value: number | string, source: string, city?: string) {
  const e: Evidence = { id: `E${s.evidence.length + 1}`, label, value, source: Q.publicUrl(source), city };
  s.evidence.push(e);
  return e.id;
}

const r2 = (x?: number) => (x == null ? undefined : Math.round(x * 100) / 100);
const isFnb = (p: Q.QPlace) => (p.tags || []).some((t) => (t.type || "").includes("cuisine") || (t.type || "").includes("menu_highlight"));
const toLite = (p: Q.QPlace): PlaceLite => ({
  id: p.entity_id,
  name: p.name,
  affinity: p.query?.affinity,
  popularity: p.popularity,
  neighborhood: p.properties?.neighborhood,
  address: p.properties?.address,
  priceLevel: p.properties?.price_level,
  lat: p.location?.lat,
  lng: p.location?.lon,
  tags: (p.tags || []).filter((t) => /menu_highlight|cuisine|specialty_dish/.test(t.type || "")).map((t) => t.name).slice(0, 8),
});

function cityOf(s: RunState, cityId: string) {
  const c = s.pack.cities.find((x) => x.id === cityId);
  if (!c || !s.cities[cityId]) throw new Error(`Unknown city_id "${cityId}". Valid: ${s.cityIds.join(", ")}`);
  return c;
}

type Exec = (s: RunState, args: any) => Promise<string>;
interface ToolDef { spec: ToolSpec; exec: Exec }

const fn = (name: string, description: string, properties: Record<string, unknown>, required: string[] = []): ToolSpec => ({
  type: "function",
  function: { name, description, parameters: { type: "object", properties, required } },
});

export const TOOLS: Record<string, ToolDef> = {
  search_brand_locations: {
    spec: fn("search_brand_locations", "Search Qloo for venues/entities of a brand by name. Returns entity ids, addresses and popularity.", { query: { type: "string" } }, ["query"]),
    async exec(s, { query }) {
      const { results, url } = await Q.searchEntities(String(query), "urn:entity:place", 10);
      if (!results.length) return `No Qloo place entities for "${query}". Try a shorter or alternative name.`;
      results.forEach((e) => s.seenEntities.set(e.entity_id, { name: e.name, address: e.properties?.address, popularity: e.popularity }));
      ev(s, `Qloo /search results for "${query}"`, results.length, url);
      return results.slice(0, 8).map((e) => `${e.entity_id} | ${e.name} | ${(e.properties?.address || "").slice(-48)} | pop ${r2(e.popularity)}`).join("\n");
    },
  },
  search_taste_tags: {
    spec: fn("search_taste_tags", "Find Qloo tag ids for a cuisine, dish or venue category (e.g. 'coffee', 'ramen', 'fried chicken').", { query: { type: "string" } }, ["query"]),
    async exec(s, { query }) {
      const { tags } = await Q.searchTags(String(query), 12);
      if (!tags.length) return `No place tags for "${query}".`;
      tags.forEach((t: any) => s.seenTags.set(t.id, t.name));
      return tags.slice(0, 8).map((t: any) => `${t.id} | ${t.name}`).join("\n");
    },
  },
  set_brand_profile: {
    spec: fn(
      "set_brand_profile",
      "Commit the brand's Qloo taste profile. anchor_ids: 1-3 entity ids of the brand's own venues (from search_brand_locations). tag_ids: 2-5 taste tags. category_tag: ONE tag id used to find category analogs in cities; prefer urn:tag:cuisine:qloo:* or urn:tag:category:place:* ids.",
      { anchor_ids: { type: "array", items: { type: "string" } }, tag_ids: { type: "array", items: { type: "string" } }, category_tag: { type: "string" }, summary: { type: "string", description: "One sentence on the brand's taste identity." } },
      ["anchor_ids", "category_tag", "summary"],
    ),
    async exec(s, { anchor_ids = [], tag_ids = [], category_tag, summary }) {
      const anchors = (anchor_ids as string[]).filter((id) => s.seenEntities.has(id)).slice(0, 3);
      if (!anchors.length) return "Rejected: anchor_ids must be ids returned by search_brand_locations.";
      s.profile.anchors = anchors.map((id) => ({ id, ...s.seenEntities.get(id)! }));
      s.profile.tags = (tag_ids as string[]).filter((t) => s.seenTags.has(t)).slice(0, 5).map((id) => ({ id, name: s.seenTags.get(id)! }));
      s.profile.categoryTag = typeof category_tag === "string" && category_tag.startsWith("urn:tag:") ? category_tag : s.profile.tags[0]?.id;
      s.profile.summary = String(summary || "");
      return `Profile saved: ${anchors.length} anchors, ${s.profile.tags.length} tags, category ${s.profile.categoryTag}.`;
    },
  },
  brand_demographics: {
    spec: fn("brand_demographics", "Qloo age/gender affinity of the brand's audience (positive = over-indexes).", {}),
    async exec(s) {
      if (!s.profile.anchors.length) return "Set the brand profile first.";
      let { rows, url } = await Q.demographics({ entities: s.profile.anchors.map((a) => a.id) });
      if (!rows[0] && s.profile.categoryTag) ({ rows, url } = await Q.demographics({ tags: [s.profile.categoryTag] }));
      const row = rows[0];
      if (!row) return "No demographic data.";
      s.profile.demographics = row.query;
      for (const [k, v] of Object.entries(row.query.age)) ev(s, `Audience age ${k} affinity`, r2(v)!, url);
      for (const [k, v] of Object.entries(row.query.gender)) ev(s, `Audience ${k} affinity`, r2(v)!, url);
      return `age ${Object.entries(row.query.age).map(([k, v]) => `${k}:${r2(v)}`).join(" ")}; gender ${Object.entries(row.query.gender).map(([k, v]) => `${k}:${r2(v)}`).join(" ")}`;
    },
  },
  city_audience_fit: {
    spec: fn("city_audience_fit", "For a target city, find F&B venues whose Qloo audience overlaps the brand's (taste affinity).", { city_id: { type: "string" } }, ["city_id"]),
    async exec(s, { city_id }) {
      const c = cityOf(s, city_id);
      if (!s.profile.anchors.length) return "Brand profile missing.";
      const { places, url, locality } = await Q.placeInsights({ city: c.qlooQuery, entities: s.profile.anchors.map((a) => a.id), take: 40 });
      const fnb = places.filter(isFnb).map(toLite);
      const cd = s.cities[city_id];
      cd.similar = fnb;
      cd.similarAll = places.length;
      cd.locality = locality;
      const affs = fnb.map((p) => p.affinity ?? 0);
      const mean = affs.length ? affs.reduce((a, b) => a + b, 0) / affs.length : 0;
      ev(s, "Taste-matched F&B venues", fnb.length, url, city_id);
      ev(s, "Mean audience affinity of matched venues", r2(mean)!, url, city_id);
      return `${c.name.en}: ${fnb.length} F&B matches of ${places.length}; mean affinity ${r2(mean)}. Top: ${fnb.slice(0, 5).map((p) => `${p.name} (${r2(p.affinity)}${p.neighborhood ? ", " + p.neighborhood : ""})`).join("; ")}`;
    },
  },
  city_heatmap: {
    spec: fn("city_heatmap", "Qloo location heatmap of the brand's taste affinity across a city's neighborhoods.", { city_id: { type: "string" } }, ["city_id"]),
    async exec(s, { city_id }) {
      const c = cityOf(s, city_id);
      const { cells, url } = await Q.heatmap({ city: c.qlooQuery, entities: s.profile.anchors.map((a) => a.id) });
      s.cities[city_id].heat = cells.map((x: any) => ({ lat: x.lat, lng: x.lng, affinity: x.affinity, popularity: x.popularity }));
      ev(s, "Heatmap cells with signal", cells.length, url, city_id);
      const top = [...cells].sort((a: any, b: any) => b.affinity - a.affinity).slice(0, 3);
      return `${c.name.en}: ${cells.length} heat cells. Hottest: ${top.map((t: any) => `(${t.lat.toFixed(3)},${t.lng.toFixed(3)}) aff ${r2(t.affinity)} pop ${r2(t.popularity)}`).join("; ")}`;
    },
  },
  category_analogs: {
    spec: fn("category_analogs", "List venues in the city that belong to the brand's category (proof of demand + saturation). Optionally override the tag.", { city_id: { type: "string" }, tag_id: { type: "string" } }, ["city_id"]),
    async exec(s, { city_id, tag_id }) {
      const c = cityOf(s, city_id);
      const tag = (typeof tag_id === "string" && tag_id.startsWith("urn:tag:") ? tag_id : undefined) || s.profile.categoryTag;
      if (!tag) return "No category tag; call search_taste_tags and pass tag_id.";
      const { places, url } = await Q.placeInsights({ city: c.qlooQuery, filterTags: tag, take: 50 });
      const cd = s.cities[city_id];
      cd.analogs = places.map(toLite);
      cd.analogTag = tag;
      const pops = cd.analogs.map((p) => p.popularity ?? 0);
      const mean = pops.length ? pops.reduce((a, b) => a + b, 0) / pops.length : 0;
      const sat = pops.filter((p) => p >= 0.9).length;
      ev(s, `Category analogs (${tag.split(":").pop()})`, cd.analogs.length, url, city_id);
      ev(s, "Mean popularity of analogs", r2(mean)!, url, city_id);
      ev(s, "Analogs with popularity ≥ 0.9", sat, url, city_id);
      if (!places.length) return `${c.name.en}: 0 venues for ${tag}. Try another tag via search_taste_tags (cuisine:qloo:* ids work best).`;
      return `${c.name.en}: ${places.length} analogs (cap 50), mean pop ${r2(mean)}, ${sat} at pop≥0.9. Leaders: ${cd.analogs.slice(0, 6).map((p) => `${p.name} (${r2(p.popularity)})`).join("; ")}`;
    },
  },
  local_taste_profile: {
    spec: fn("local_taste_profile", "Aggregate the menu highlights, cuisines and price levels of taste-matched venues in a city (what local diners who share the brand's taste order).", { city_id: { type: "string" } }, ["city_id"]),
    async exec(s, { city_id }) {
      const c = cityOf(s, city_id);
      const cd = s.cities[city_id];
      const pool = [...cd.similar, ...cd.analogs.slice(0, 25)];
      const counts = new Map<string, number>();
      pool.forEach((p) => (p.tags || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
      cd.localTaste = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([tag, count]) => ({ tag, count }));
      const prices: Record<string, number> = {};
      pool.forEach((p) => { if (p.priceLevel) prices[String(p.priceLevel)] = (prices[String(p.priceLevel)] || 0) + 1; });
      cd.priceLevels = prices;
      if (!pool.length) return `${c.name.en}: no venue data yet (run city_audience_fit / category_analogs first).`;
      return `${c.name.en} (${pool.length} venues): top tags ${cd.localTaste.map((t) => `${t.tag}×${t.count}`).join(", ")}; price levels ${JSON.stringify(prices)}`;
    },
  },
  cross_domain_tastes: {
    spec: fn(
      "cross_domain_tastes",
      "Cross-domain tastes of the brand's audience in a city: domain is one of artist, movie, tv_show, person, brand, podcast.",
      { city_id: { type: "string" }, domain: { type: "string", enum: ["artist", "movie", "tv_show", "person", "brand", "podcast"] } },
      ["city_id", "domain"],
    ),
    async exec(s, { city_id, domain }) {
      const c = cityOf(s, city_id);
      const type = `urn:entity:${domain}` as Q.CrossDomain;
      const { entities, url } = await Q.crossDomain({ type, city: c.qlooQuery, entities: s.profile.anchors.map((a) => a.id), take: 8 });
      s.cities[city_id].culture[domain] = entities.map((e) => ({ name: e.name, affinity: r2(e.query?.affinity) }));
      ev(s, `Cross-domain ${domain} results`, entities.length, url, city_id);
      return `${c.name.en} ${domain}: ${entities.map((e) => `${e.name} (${r2(e.query?.affinity)})`).join("; ") || "none"}`;
    },
  },
};

export function toolSpecs(names: string[]) {
  return names.map((n) => TOOLS[n].spec);
}

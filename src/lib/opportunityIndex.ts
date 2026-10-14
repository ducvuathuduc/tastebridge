import "server-only";
import * as Q from "./qloo/client";
import { scoreCity } from "./scoring";
import type { PlaceLite, ScoreBreakdown } from "./types";
import { vietnam } from "./markets/packs/vietnam";

/** Foreign F&B brands with no Vietnam presence (checked 2026-10-14). */
export const INDEX_BRANDS: { brand: string; category: string; categoryTag: string; origin: string; check: "web+qloo" | "qloo" }[] = [
  { brand: "Blue Bottle Coffee", category: "Specialty coffee", categoryTag: "urn:tag:category:place:coffee_shop", origin: "US", check: "web+qloo" },
  { brand: "Ichiran", category: "Ramen", categoryTag: "urn:tag:cuisine:qloo:ramen", origin: "JP", check: "web+qloo" },
  { brand: "Five Guys", category: "Burgers", categoryTag: "urn:tag:cuisine:qloo:burgers", origin: "US", check: "web+qloo" },
  { brand: "Tim Hortons", category: "Coffee & donuts", categoryTag: "urn:tag:category:place:coffee_shop", origin: "CA", check: "web+qloo" },
  { brand: "Chick-fil-A", category: "Fried chicken", categoryTag: "urn:tag:cuisine:qloo:fried_chicken", origin: "US", check: "qloo" },
  { brand: "In-N-Out Burger", category: "Burgers", categoryTag: "urn:tag:cuisine:qloo:burgers", origin: "US", check: "qloo" },
  { brand: "Dutch Bros Coffee", category: "Drive-thru coffee", categoryTag: "urn:tag:category:place:coffee_shop", origin: "US", check: "qloo" },
  { brand: "Raising Cane's", category: "Chicken fingers", categoryTag: "urn:tag:cuisine:qloo:fried_chicken", origin: "US", check: "qloo" },
  { brand: "Sweetgreen", category: "Salads", categoryTag: "urn:tag:cuisine:qloo:salad", origin: "US", check: "qloo" },
];
const CITY_IDS = ["hcmc", "hanoi", "danang"];

export interface IndexRow { brand: string; category: string; origin: string; check: string; best: { cityId: string; score: number; verdict: ScoreBreakdown["verdict"] } | null; cities: Record<string, ScoreBreakdown>; anchor?: string; error?: string }

let cache: { at: number; rows: IndexRow[] } | null = null;
let inflight: Promise<IndexRow[]> | null = null;
const TTL = 1000 * 60 * 60 * 6;

const isFnb = (p: Q.QPlace) => (p.tags || []).some((t) => /cuisine|menu_highlight/.test(t.type || ""));
const lite = (p: Q.QPlace): PlaceLite => ({ id: p.entity_id, name: p.name, affinity: p.query?.affinity, popularity: p.popularity });

async function rowFor(b: (typeof INDEX_BRANDS)[number]): Promise<IndexRow> {
  try {
    const { results } = await Q.searchEntities(b.brand, "urn:entity:place", 10);
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = norm(b.brand).slice(0, 8);
    const anchors = results.filter((e) => norm(e.name).includes(key)).sort((x, y) => (y.popularity ?? 0) - (x.popularity ?? 0)).slice(0, 3);
    if (!anchors.length) return { brand: b.brand, category: b.category, origin: b.origin, check: b.check, best: null, cities: {}, error: "no Qloo entity" };
    const ids = anchors.map((a) => a.entity_id);
    const cities: Record<string, ScoreBreakdown> = {};
    for (const cid of CITY_IDS) {
      const c = vietnam.cities.find((x) => x.id === cid)!;
      const [sim, an, hm] = await Promise.all([
        Q.placeInsights({ city: c.qlooQuery, entities: ids, take: 40 }),
        Q.placeInsights({ city: c.qlooQuery, filterTags: b.categoryTag, take: 50 }),
        Q.heatmap({ city: c.qlooQuery, entities: ids }),
      ]);
      cities[cid] = scoreCity({ similar: sim.places.filter(isFnb).map(lite), analogs: an.places.map(lite), heat: hm.cells });
    }
    const bestId = Object.keys(cities).sort((x, y) => cities[y].score - cities[x].score)[0];
    return { brand: b.brand, category: b.category, origin: b.origin, check: b.check, anchor: anchors[0].name, cities, best: { cityId: bestId, score: cities[bestId].score, verdict: cities[bestId].verdict } };
  } catch (e) {
    return { brand: b.brand, category: b.category, origin: b.origin, check: b.check, best: null, cities: {}, error: (e as Error).message.slice(0, 120) };
  }
}

export async function getIndex(): Promise<{ rows: IndexRow[]; at: number }> {
  if (cache && Date.now() - cache.at < TTL) return cache;
  if (!inflight) {
    inflight = (async () => {
      const prev = new Map((cache?.rows || []).filter((r) => !r.error).map((r) => [r.brand, r]));
      const rows: IndexRow[] = [];
      const queue = [...INDEX_BRANDS];
      await Promise.all(Array.from({ length: 2 }, async () => {
        while (queue.length) {
          const b = queue.shift()!;
          let row = await rowFor(b);
          if (row.error && !/no Qloo entity/.test(row.error)) row = await rowFor(b); // one retry on transient errors
          rows.push(row.error && prev.has(b.brand) ? prev.get(b.brand)! : row);
        }
      }));
      rows.sort((a, b) => (b.best?.score ?? -1) - (a.best?.score ?? -1));
      // Cache fully only when every row succeeded; otherwise keep it short so failed rows retry soon.
      cache = { at: rows.some((r) => r.error) ? Date.now() - TTL + 5 * 60 * 1000 : Date.now(), rows };
      return rows;
    })().finally(() => { inflight = null; });
  }
  await inflight;
  return cache!;
}

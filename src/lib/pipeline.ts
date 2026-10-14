import "server-only";
import { getPack } from "./markets";
import { newState, type RunState } from "./tools";
import { runAgent, ensureTool, type Emit } from "./agents/runner";
import { AGENTS, PIPELINE } from "./agents/registry";
import { bestNeighborhood, budgetBand, scoreCity } from "./scoring";
import type { RunInput, ScoreBreakdown } from "./types";

/** Compact, figure-complete digest the committee & planning agents reason over. */
export function buildDigest(s: RunState, scores: Record<string, ScoreBreakdown>, input: RunInput) {
  const cities = s.cityIds.map((id) => {
    const c = s.cities[id];
    const sc = scores[id];
    const bn = bestNeighborhood(c);
    const band = budgetBand(sc.verdict, input.budget?.amount);
    return {
      city_id: id,
      city: c.cityName,
      verdict: sc.verdict,
      taste_fit_score: sc.score,
      confidence: sc.confidence,
      parts: sc.parts,
      inputs: sc.inputs,
      budget_band: input.budget ? `${Math.round(band.shareLo * 100)}–${Math.round(band.shareHi * 100)}% of stated ${input.budget.currency} ${input.budget.amount.toLocaleString("en-US")} = ${band.lo?.toLocaleString("en-US")}–${band.hi?.toLocaleString("en-US")}` : `${Math.round(band.shareLo * 100)}–${Math.round(band.shareHi * 100)}% of the founder's phase-1 budget`,
      best_neighborhood: bn ? { name: bn.neighborhood, nearest_matched_venue: bn.nearestPlace, cell_affinity: bn.cell.affinity } : null,
      top_matched_venues: c.similar.slice(0, 5).map((p) => ({ name: p.name, affinity: p.affinity && +p.affinity.toFixed(2), neighborhood: p.neighborhood })),
      analog_leaders: c.analogs.slice(0, 5).map((p) => ({ name: p.name, popularity: p.popularity && +p.popularity.toFixed(2) })),
      local_taste: c.localTaste.slice(0, 8),
      culture: Object.fromEntries(Object.entries(c.culture).map(([k, v]) => [k, v.slice(0, 4).map((x) => x.name)])),
    };
  });
  return JSON.stringify({
    brand: s.profile.name,
    brand_summary: s.profile.summary,
    audience_demographics: s.profile.demographics,
    direction: s.pack.direction,
    cities,
  });
}

export async function runPipeline(input: RunInput, emit: Emit) {
  const t0 = Date.now();
  const pack = getPack(input.pack);
  const cityIds = input.cities.filter((c) => pack.cities.some((x) => x.id === c)).slice(0, 4);
  if (!cityIds.length) throw new Error("Pick at least one city");
  const s = newState(pack, cityIds, input.brand);
  emit({ type: "run_start", runId: `r${t0.toString(36)}`, input, agents: PIPELINE.map((id) => ({ id, name: AGENTS[id].name[input.lang] })) });

  // 1. Profile
  await runAgent("profiler", s, input, emit);
  if (!s.profile.anchors.length) throw new Error(`Qloo has no venue data for "${input.brand}" yet. Try the brand's exact name or a flagship location.`);
  if (!s.profile.demographics) await ensureTool("profiler", "brand_demographics", {}, s, emit);
  emit({ type: "profile", profile: s.profile });

  // 2. Scout + Analogs (parallel, different model tiers)
  await Promise.all([runAgent("scout", s, input, emit), runAgent("analog", s, input, emit)]);
  for (const id of cityIds) {
    const c = s.cities[id];
    if (!c.similar.length) await ensureTool("scout", "city_audience_fit", { city_id: id }, s, emit);
    if (!c.heat.length) await ensureTool("scout", "city_heatmap", { city_id: id }, s, emit);
    if (!c.analogs.length) await ensureTool("analog", "category_analogs", { city_id: id }, s, emit);
  }

  // 3. Culture + Localization
  const [culture, localize] = await Promise.all([runAgent("culture", s, input, emit), runAgent("localize", s, input, emit)]);
  for (const id of cityIds) if (!s.cities[id].localTaste.length) await ensureTool("localize", "local_taste_profile", { city_id: id }, s, emit);
  for (const id of cityIds) emit({ type: "city_data", data: s.cities[id] });

  // 4. Deterministic Taste-Fit scores
  const scores = Object.fromEntries(cityIds.map((id) => [id, scoreCity(s.cities[id])]));
  emit({ type: "scores", scores });
  emit({ type: "evidence", items: s.evidence });
  const digest = buildDigest(s, scores, input);

  // 5. Investment committee
  const [bull, bear] = await Promise.all([runAgent("bull", s, input, emit, { digest }), runAgent("bear", s, input, emit, { digest })]);
  await runAgent("chair", s, input, emit, { digest, bull: JSON.stringify(bull), bear: JSON.stringify(bear) });

  // 6. A–Z: launch plan, demand validation, partner match
  const hasGo = Object.values(scores).some((x) => x.verdict !== "NO-GO");
  const loc = JSON.stringify(localize);
  const goCities = cityIds.filter((id) => scores[id].verdict !== "NO-GO");
  if (hasGo) await runAgent("launch", s, input, emit, { digest, localize: loc, culture, goCities });
  await Promise.all([runAgent("validate", s, input, emit, { digest, localize: loc }), runAgent("partners", s, input, emit, { digest })]);

  emit({ type: "done", ms: Date.now() - t0 });
}

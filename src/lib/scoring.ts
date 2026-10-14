import type { CityData, ScoreBreakdown } from "./types";

/**
 * Taste-Fit Score: a transparent, deterministic composite of Qloo signals.
 * The LLM agents never produce numbers; they argue over this breakdown.
 *
 *   audienceFit  = mean Qloo affinity of the F&B places in the city whose audience overlaps the brand (0..1)
 *   demandProof  = 0.5 × min(1, analogs / 30) + 0.5 × mean Qloo popularity of category analogs
 *   whitespace   = 1 − share of analogs with popularity ≥ 0.9 (saturation by category leaders)
 *   score        = 100 × (0.5·audienceFit + 0.3·demandProof + 0.2·whitespace)
 */
export const WEIGHTS = { audienceFit: 0.5, demandProof: 0.3, whitespace: 0.2 } as const;
export const THRESHOLDS = { go: 70, pilot: 55 } as const;
export const SATURATION_POP = 0.9;

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const round = (x: number, d = 3) => Math.round(x * 10 ** d) / 10 ** d;

export function scoreCity(d: Pick<CityData, "similar" | "analogs" | "heat">): ScoreBreakdown {
  const affs = d.similar.map((p) => p.affinity ?? 0).filter((x) => x > 0);
  const meanAffinity = mean(affs);
  const analogCount = d.analogs.length;
  const analogMeanPopularity = mean(d.analogs.map((p) => p.popularity ?? 0));
  const saturated = d.analogs.filter((p) => (p.popularity ?? 0) >= SATURATION_POP).length;
  const saturatedShare = analogCount ? saturated / analogCount : 0;

  const audienceFit = meanAffinity;
  const demandProof = 0.5 * Math.min(1, analogCount / 30) + 0.5 * analogMeanPopularity;
  const whitespace = analogCount ? 1 - saturatedShare : 0.5;
  const score = Math.round(100 * (WEIGHTS.audienceFit * audienceFit + WEIGHTS.demandProof * demandProof + WEIGHTS.whitespace * whitespace));

  const signals = [affs.length >= 12, analogCount >= 15, d.heat.length >= 15];
  const nTrue = signals.filter(Boolean).length;
  const confidence: ScoreBreakdown["confidence"] = nTrue === 3 ? "high" : nTrue === 2 ? "medium" : "low";

  let verdict: ScoreBreakdown["verdict"] = score >= THRESHOLDS.go ? "GO" : score >= THRESHOLDS.pilot ? "PILOT" : "NO-GO";
  // Thin data never earns a full GO: test first.
  if (verdict === "GO" && confidence === "low") verdict = "PILOT";

  return {
    score,
    verdict,
    confidence,
    parts: { audienceFit: round(audienceFit), demandProof: round(demandProof), whitespace: round(whitespace) },
    inputs: { meanAffinity: round(meanAffinity), fnbMatches: affs.length, analogCount, analogMeanPopularity: round(analogMeanPopularity), saturatedShare: round(saturatedShare), heatCells: d.heat.length },
  };
}

/** Budget bands are shares of the founder's own stated budget — never invented market costs. */
export const BUDGET_BANDS: Record<ScoreBreakdown["verdict"], [number, number]> = {
  GO: [0.5, 0.8],
  PILOT: [0.15, 0.3],
  "NO-GO": [0, 0.05],
};

export function budgetBand(verdict: ScoreBreakdown["verdict"], budget?: number) {
  const [lo, hi] = BUDGET_BANDS[verdict];
  return { shareLo: lo, shareHi: hi, lo: budget ? Math.round(budget * lo) : undefined, hi: budget ? Math.round(budget * hi) : undefined };
}

/** Pick the hottest heatmap cell and the nearest matched place to name the neighborhood. */
export function bestNeighborhood(d: Pick<CityData, "heat" | "similar" | "analogs">) {
  if (!d.heat.length) return undefined;
  const top = [...d.heat].sort((a, b) => b.affinity - a.affinity || b.popularity - a.popularity)[0];
  const places = [...d.similar, ...d.analogs].filter((p) => p.lat != null && p.lng != null);
  let nearest: (typeof places)[number] | undefined;
  let best = Infinity;
  for (const p of places) {
    const dist = (p.lat! - top.lat) ** 2 + (p.lng! - top.lng) ** 2;
    if (dist < best) { best = dist; nearest = p; }
  }
  return { cell: top, nearestPlace: nearest?.name, neighborhood: nearest?.neighborhood || nearest?.address?.split(",").slice(-3, -1).join(",").trim() };
}

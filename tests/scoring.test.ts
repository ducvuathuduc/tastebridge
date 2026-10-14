import { describe, expect, it } from "vitest";
import { bestNeighborhood, budgetBand, scoreCity, THRESHOLDS, WEIGHTS } from "@/lib/scoring";
import type { PlaceLite, HeatCell } from "@/lib/types";

const places = (n: number, affinity: number, popularity = 0.5): PlaceLite[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `P${i}`, affinity, popularity, lat: 10 + i * 0.001, lng: 106 + i * 0.001, neighborhood: i === 0 ? "District 1" : "Elsewhere" }));
const heat = (n: number): HeatCell[] => Array.from({ length: n }, (_, i) => ({ lat: 10 + i * 0.01, lng: 106, affinity: i === 0 ? 1 : 0.5, popularity: 0.5 }));

describe("scoreCity", () => {
  it("weights sum to 1", () => {
    expect(WEIGHTS.audienceFit + WEIGHTS.demandProof + WEIGHTS.whitespace).toBeCloseTo(1);
  });

  it("computes the documented formula", () => {
    const s = scoreCity({ similar: places(20, 0.7), analogs: places(30, 0.5, 0.6), heat: heat(20) });
    // audienceFit .7, demandProof .5*1 + .5*.6 = .8, whitespace 1 (none ≥ .9)
    expect(s.score).toBe(Math.round(100 * (0.5 * 0.7 + 0.3 * 0.8 + 0.2 * 1)));
    expect(s.confidence).toBe("high");
    expect(s.verdict).toBe(s.score >= THRESHOLDS.go ? "GO" : "PILOT");
  });

  it("penalises saturation by category leaders", () => {
    const open = scoreCity({ similar: places(20, 0.65), analogs: places(30, 0, 0.6), heat: heat(20) });
    const saturated = scoreCity({ similar: places(20, 0.65), analogs: places(30, 0, 0.95), heat: heat(20) });
    expect(saturated.parts.whitespace).toBe(0);
    expect(saturated.parts.whitespace).toBeLessThan(open.parts.whitespace);
  });

  it("never gives a full GO on thin data", () => {
    const s = scoreCity({ similar: places(3, 0.99), analogs: places(2, 0, 0.8), heat: [] });
    expect(s.confidence).toBe("low");
    expect(s.verdict).not.toBe("GO");
  });

  it("handles empty input without NaN", () => {
    const s = scoreCity({ similar: [], analogs: [], heat: [] });
    expect(Number.isNaN(s.score)).toBe(false);
    expect(s.verdict).toBe("NO-GO");
  });
});

describe("budgetBand", () => {
  it("expresses bands as shares of the user's own budget", () => {
    expect(budgetBand("GO", 1000)).toEqual({ shareLo: 0.5, shareHi: 0.8, lo: 500, hi: 800 });
    expect(budgetBand("NO-GO").lo).toBeUndefined();
  });
});

describe("bestNeighborhood", () => {
  it("names the matched venue nearest the hottest cell", () => {
    const bn = bestNeighborhood({ heat: heat(5), similar: places(5, 0.6), analogs: [] });
    expect(bn?.cell.affinity).toBe(1);
    expect(bn?.neighborhood).toBe("District 1");
  });
});

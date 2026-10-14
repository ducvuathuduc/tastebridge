import { describe, expect, it } from "vitest";
import { computeRoi } from "@/lib/roi";
import { extractJson } from "@/lib/llm";
import { getPack, MARKET_PACKS } from "@/lib/markets";

describe("computeRoi", () => {
  it("computes payback, break-even and year-1 cash from user inputs only", () => {
    const r = computeRoi({ capex: 120000, monthlyRevenue: 50000, marginPct: 40, monthlyFixed: 10000 });
    expect(r.monthlyProfit).toBe(10000);
    expect(r.paybackMonths).toBe(12);
    expect(r.breakevenRevenue).toBe(25000);
    expect(r.year1Cash).toBe(0);
  });
  it("returns null payback when the outlet never earns", () => {
    expect(computeRoi({ capex: 1, monthlyRevenue: 100, marginPct: 10, monthlyFixed: 50 }).paybackMonths).toBeNull();
  });
});

describe("extractJson", () => {
  it("parses fenced and embedded JSON", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJson('Here you go: {"b":[1,2]} thanks')).toEqual({ b: [1, 2] });
    expect(extractJson("nope")).toBeNull();
  });
});

describe("market packs", () => {
  it("every pack's default cities exist", () => {
    for (const p of Object.values(MARKET_PACKS)) for (const id of p.defaultCities) expect(p.cities.some((c) => c.id === id)).toBe(true);
  });
  it("falls back to Vietnam", () => {
    expect(getPack("unknown").id).toBe("vn");
  });
});

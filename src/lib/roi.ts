/** Scenario ROI from the founder's own assumptions only. Pure + unit-tested. */
export interface RoiInput { capex: number; monthlyRevenue: number; marginPct: number; monthlyFixed: number }
export interface RoiOutput { monthlyProfit: number; paybackMonths: number | null; breakevenRevenue: number | null; year1Cash: number }

export function computeRoi({ capex, monthlyRevenue, marginPct, monthlyFixed }: RoiInput): RoiOutput {
  const m = Math.max(0, Math.min(100, marginPct)) / 100;
  const monthlyProfit = monthlyRevenue * m - monthlyFixed;
  const paybackMonths = monthlyProfit > 0 ? Math.ceil(capex / monthlyProfit) : null;
  const breakevenRevenue = m > 0 ? monthlyFixed / m : null;
  return { monthlyProfit, paybackMonths, breakevenRevenue, year1Cash: monthlyProfit * 12 - capex };
}

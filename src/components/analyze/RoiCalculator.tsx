"use client";
import { useState } from "react";
import { Calculator } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { computeRoi } from "@/lib/roi";
import { formatMoney } from "@/lib/format";
import { Card, SectionTitle } from "../ui";

const field = "w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm font-mono tabular-nums focus:border-saffron-500 focus:outline-none focus:ring-2 focus:ring-saffron-300/50";

export function RoiCalculator({ defaultCurrency = "USD" }: { defaultCurrency?: "USD" | "VND" }) {
  const { t, lang } = useI18n();
  const [cur, setCur] = useState<"USD" | "VND">(defaultCurrency);
  const [v, setV] = useState({ capex: "", monthlyRevenue: "", marginPct: "", monthlyFixed: "" });
  const n = (s: string) => Number(s.replace(/[^\d.]/g, "")) || 0;
  const filled = v.capex && v.monthlyRevenue && v.marginPct;
  const r = computeRoi({ capex: n(v.capex), monthlyRevenue: n(v.monthlyRevenue), marginPct: n(v.marginPct), monthlyFixed: n(v.monthlyFixed) });
  const F = (k: keyof typeof v, label: string, ph: string) => (
    <label className="block text-xs">
      <span className="mb-1 block font-medium text-ink-700">{label}</span>
      <input className={field} inputMode="decimal" value={v[k]} placeholder={ph} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
    </label>
  );
  return (
    <Card id="roi">
      <SectionTitle icon={Calculator} hint={<select aria-label="Currency" value={cur} onChange={(e) => setCur(e.target.value as any)} className="rounded-lg border border-line bg-white px-2 py-1 text-xs"><option>USD</option><option>VND</option></select>}>{t.run.roi}</SectionTitle>
      <p className="mb-4 text-xs text-ink-500">{t.run.roiHelp}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {F("capex", `${t.roi.capex} (${cur})`, lang === "vi" ? "giả định của bạn" : "your assumption")}
        {F("monthlyRevenue", `${t.roi.monthlyRevenue} (${cur})`, lang === "vi" ? "giả định của bạn" : "your assumption")}
        {F("marginPct", t.roi.margin, "%")}
        {F("monthlyFixed", `${t.roi.fixed} (${cur})`, lang === "vi" ? "giả định của bạn" : "your assumption")}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3" aria-live="polite">
        <Out k={t.roi.payback} v={filled ? (r.paybackMonths ? `${r.paybackMonths} ${t.roi.months}` : t.roi.never) : "—"} />
        <Out k={t.roi.breakeven} v={filled && r.breakevenRevenue != null ? formatMoney(r.breakevenRevenue, cur, lang) : "—"} />
        <Out k={t.roi.year1} v={filled ? formatMoney(r.year1Cash, cur, lang) : "—"} neg={!!filled && r.year1Cash < 0} />
      </div>
    </Card>
  );
}
function Out({ k, v, neg }: { k: string; v: string; neg?: boolean }) {
  return <div className="rounded-xl bg-paper-2 p-3"><p className="text-xs text-ink-500">{k}</p><p className={`mt-1 font-mono text-lg tabular-nums ${neg ? "text-nogo" : "text-ink-950"}`}>{v}</p></div>;
}

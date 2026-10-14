"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getPack } from "@/lib/markets";
import { PRESETS } from "@/lib/presets";
import type { RunInput } from "@/lib/types";
import { cn } from "@/lib/cn";

const field = "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-saffron-500 focus:outline-none focus:ring-2 focus:ring-saffron-300/50";

export function AnalyzeForm({ onRun, running }: { onRun: (i: RunInput) => void; running: boolean }) {
  const { t, lang } = useI18n();
  const [brand, setBrand] = useState("");
  const [homeCity, setHome] = useState("");
  const [items, setItems] = useState("");
  const [website, setWebsite] = useState("");
  const [packId, setPack] = useState<"vn" | "global">("vn");
  const pack = getPack(packId);
  const [cities, setCities] = useState<string[]>(pack.defaultCities);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "VND">("USD");

  const switchPack = (p: "vn" | "global") => { setPack(p); setCities(getPack(p).defaultCities); };
  const toggleCity = (id: string) => setCities((cs) => (cs.includes(id) ? cs.filter((c) => c !== id) : cs.length >= 4 ? cs : [...cs, id]));
  const applyPreset = (i: number) => {
    const p = PRESETS[i];
    setBrand(p.brand); setHome(p.homeCity); setItems(p.items); setPack(p.pack); setCities(p.cities);
  };
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("brand");
    if (!q) return;
    const i = PRESETS.findIndex((p) => p.brand.toLowerCase() === q.toLowerCase());
    if (i >= 0) applyPreset(i); else setBrand(q.slice(0, 80));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const amt = Number(amount.replace(/[^\d.]/g, ""));
  const valid = brand.trim().length >= 2 && cities.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || running) return;
        onRun({ brand: brand.trim(), homeCity: homeCity.trim() || undefined, signatureItems: items.trim() || undefined, website: website.trim() || undefined, pack: packId, cities, lang, budget: amt > 0 ? { amount: amt, currency } : undefined });
      }}
      className="space-y-5"
      aria-label={t.form.title}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{t.form.presets}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button type="button" key={p.brand} onClick={() => applyPreset(i)} title={p.note[lang]}
              className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", brand === p.brand ? "border-ink-900 bg-ink-900 text-paper" : "border-line bg-white text-ink-700 hover:border-ink-400")}>
              {p.brand}{p.pack === "global" ? " ↗" : ""}
            </button>
          ))}
        </div>
        {PRESETS.find((p) => p.brand === brand) && <p className="mt-2 text-xs text-ink-500">{PRESETS.find((p) => p.brand === brand)!.note[lang]}</p>}
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-800">{t.form.direction}</legend>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-paper-2 p-1">
          {(["vn", "global"] as const).map((p) => (
            <button type="button" key={p} onClick={() => switchPack(p)} aria-pressed={packId === p}
              className={cn("rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm", packId === p ? "bg-white text-ink-950 shadow-sm" : "text-ink-500 hover:text-ink-800")}>
              {p === "vn" ? t.form.inbound : t.form.outbound}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">{t.form.brand} *</span>
          <input className={field} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={t.form.brandPh} required minLength={2} maxLength={80} autoComplete="off" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">{t.form.home}</span>
          <input className={field} value={homeCity} onChange={(e) => setHome(e.target.value)} placeholder={t.form.homePh} maxLength={80} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">{t.form.website}</span>
          <input className={field} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" maxLength={200} inputMode="url" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">{t.form.items}</span>
          <input className={field} value={items} onChange={(e) => setItems(e.target.value)} placeholder={t.form.itemsPh} maxLength={200} />
        </label>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-800">{t.form.cities}</legend>
        <div className="flex flex-wrap gap-2">
          {pack.cities.map((c) => {
            const on = cities.includes(c.id);
            return (
              <button type="button" key={c.id} onClick={() => toggleCity(c.id)} aria-pressed={on}
                className={cn("group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition", on ? "border-ink-900 bg-ink-900 text-paper" : "border-line bg-white text-ink-700 hover:border-ink-400")}>
                {c.name[lang]}
                <span title={t.form.coverage[c.coverage]} className={cn("h-1.5 w-1.5 rounded-full", c.coverage === "deep" ? "bg-go" : c.coverage === "medium" ? "bg-pilot" : "bg-ink-300")} />
              </button>
            );
          })}
        </div>
        <p className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-go" /> {t.form.coverage.deep}</span>
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-pilot" /> {t.form.coverage.medium}</span>
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-ink-300" /> {t.form.coverage.thin}</span>
        </p>
      </fieldset>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink-800">{t.form.budget}</span>
        <div className="flex gap-2">
          <input className={field} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={currency === "USD" ? "500,000" : "12,000,000,000"} inputMode="decimal" aria-label={t.form.budget} />
          <select className={cn(field, "w-28")} value={currency} onChange={(e) => setCurrency(e.target.value as "USD" | "VND")} aria-label="Currency">
            <option value="USD">USD</option>
            <option value="VND">VND</option>
          </select>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">{t.form.budgetHelp}</p>
      </div>

      <button type="submit" disabled={!valid || running}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-sm font-semibold text-paper transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50">
        {running ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.form.running}</> : <>{t.form.run} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}
      </button>
    </form>
  );
}

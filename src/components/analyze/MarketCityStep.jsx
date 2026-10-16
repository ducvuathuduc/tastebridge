import { ArrowRight, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cities, categories } from "@/lib/analyzeData";

export default function MarketCityStep({ cityId, categoryId, onCity, onCategory, onContinue }) {
  const { t, lang } = useLang();
  const canContinue = cityId && categoryId;
  const labelCls = "mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground";
  const selectCls =
    "h-11 w-full appearance-none rounded-md border border-border bg-transparent px-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onContinue();
      }}
      className="rounded-lg border border-border p-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={labelCls}>
            {t("analyze.city")}
          </label>
          <div className="relative">
            <select id="city" value={cityId} onChange={(e) => onCity(e.target.value)} className={selectCls}>
              <option value="" disabled>
                {t("analyze.cityPh")}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id} className="bg-background text-foreground">
                  {c.name[lang]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div>
          <label htmlFor="category" className={labelCls}>
            {t("analyze.category")}
          </label>
          <div className="relative">
            <select
              id="category"
              value={categoryId}
              onChange={(e) => onCategory(e.target.value)}
              className={selectCls}
            >
              <option value="" disabled>
                {t("analyze.categoryPh")}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-background text-foreground">
                  {c.name[lang]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!canContinue}
        className="btn-primary mt-6 h-11 w-full px-6 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("cta.toBrand")}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
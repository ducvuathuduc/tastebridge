import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cities, categories } from "@/lib/analyzeData";

export default function BrandStep({ brandName, setBrandName, cityId, categoryId, onBack, onSubmit }) {
  const { t, lang } = useLang();
  const city = cities.find((c) => c.id === cityId);
  const category = categories.find((c) => c.id === categoryId);
  const canSubmit = brandName.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className="rounded-lg border border-border p-8"
    >
      <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-secondary px-4 py-3">
        <span className="truncate font-mono text-xs text-muted-foreground">
          {city?.name[lang]} · {category?.name[lang]}
        </span>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {t("cta.back")}
        </button>
      </div>
      <div className="mt-6">
        <label htmlFor="brandName" className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("analyze.brand")}
        </label>
        <input
          id="brandName"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder={t("analyze.brandPh")}
          maxLength={80}
          className="h-11 w-full rounded-md border border-border bg-transparent px-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary mt-6 h-11 w-full px-6 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("analyze.submit")}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
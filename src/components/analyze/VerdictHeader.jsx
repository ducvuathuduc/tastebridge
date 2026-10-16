import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import { verdictStyles } from "./badges";

export default function VerdictHeader({ result }) {
  const { t } = useLang();
  const v = verdictStyles[result.verdict] || verdictStyles.PILOT;
  return (
    <FadeUp>
      <section className={`rounded-lg border p-8 sm:p-10 ${v.badge}`}>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("result.verdict")}
        </p>
        <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className={`text-6xl font-semibold tracking-tight sm:text-7xl ${v.text}`}>
              {result.verdict}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed sm:text-base">{result.headline}</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {result.verdictRationale}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {t("result.confidence")}
              </p>
              <p className={`mt-1 font-mono text-4xl ${v.text}`}>{result.confidence}%</p>
              <div className="mt-3 h-1 w-40 rounded-full bg-border">
                <div className={`h-1 rounded-full ${v.dot}`} style={{ width: `${result.confidence}%` }} />
              </div>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {t("result.opportunity")}
              </p>
              <p className={`mt-1 font-mono text-4xl ${v.text}`}>{result.opportunityIndex ?? "—"}</p>
              <div className="mt-3 h-1 w-40 rounded-full bg-border">
                <div
                  className={`h-1 rounded-full ${v.dot}`}
                  style={{ width: `${result.opportunityIndex ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeUp>
  );
}
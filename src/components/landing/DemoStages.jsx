import { agents } from "@/lib/agentsData";
import { cities, categories, neighborhoods } from "@/lib/analyzeData";
import { useLang } from "@/lib/i18n";

const BRAND = "Blue Bottle Coffee";
const CITY = cities.find((c) => c.id === "hcmc");
const CATEGORY = categories.find((c) => c.id === "coffee_tea");

const QLOO_CHIPS = {
  cityScout: "QLOO · 8 CITY HOTSPOTS",
  tasteAffinity: "QLOO · AFFINITY 0.82",
  competitorScan: "QLOO · 6 RELATED BRANDS",
};

export function DemoBrand({ progress, done }) {
  const { t, lang } = useLang();
  const typed = BRAND.slice(0, Math.ceil(Math.min(1, progress) * BRAND.length));
  const chipCls =
    "rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] text-muted-foreground";
  return (
    <div className="w-full max-w-md">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {t("analyze.brand")}
      </p>
      <div className="mt-2 flex h-11 items-center rounded-md border border-border px-4 text-sm">
        {typed}
        <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-foreground" />
      </div>
      <div
        className={`mt-4 flex flex-wrap gap-2 transition-all duration-500 ${
          done ? "opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        <span className={chipCls}>{CITY.name[lang]}</span>
        <span className={chipCls}>{CATEGORY.name[lang]}</span>
      </div>
      <div
        className={`mt-4 flex justify-end transition-all duration-500 ${
          done ? "opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground">
          {t("analyze.submit")}
        </span>
      </div>
    </div>
  );
}

export function DemoAgents({ lit }) {
  const { t, lang } = useLang();
  return (
    <div className="w-full max-w-md space-y-1.5">
      {agents.map((a, i) => {
        const on = i < lit;
        const current = i === lit;
        return (
          <div
            key={a.id}
            className={`flex items-center gap-2.5 rounded-md border px-3 py-1 transition-colors duration-300 ${
              on || current ? "border-border bg-secondary" : "border-transparent"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                on ? "bg-foreground" : current ? "animate-pulse bg-foreground" : "bg-muted-foreground/30"
              }`}
            />
            <span
              className={`font-mono text-[10px] ${
                on || current ? "text-muted-foreground" : "text-muted-foreground/40"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={`truncate text-xs ${on || current ? "text-foreground" : "text-muted-foreground/40"}`}>
              {a.name[lang]}
            </span>
            {on &&
              (QLOO_CHIPS[a.id] ? (
                <span className="ml-auto hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground sm:block">
                  {QLOO_CHIPS[a.id]}
                </span>
              ) : (
                <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
                  {t("analyze.done")}
                </span>
              ))}
          </div>
        );
      })}
    </div>
  );
}

export function DemoVerdict({ step }) {
  const { t } = useLang();
  const bars = [
    { label: t("result.confidence"), value: 85 },
    { label: t("result.opportunity"), value: 72 },
  ];
  return (
    <div className="w-full max-w-md">
      <span className="inline-flex items-center rounded-md border border-verdict-pilot/40 bg-verdict-pilot/10 px-4 py-2 font-mono text-sm uppercase tracking-widest text-verdict-pilot">
        PILOT
      </span>
      <div className="mt-6 space-y-4">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>{b.label}</span>
              <span>{b.value}%</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-border">
              <div
                className="h-1 rounded-full bg-verdict-pilot transition-all duration-700"
                style={{ width: step >= 1 ? `${b.value}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
      {step >= 2 && (
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Cultivating the slow-coffee ritual in HCMC&apos;s premium niche.
        </p>
      )}
    </div>
  );
}

const TILES = [0, 3, 5, 6, 4, 9].map((i) => neighborhoods.hcmc[i]);
const SCORES = [92, 88, 76, 68, 57, 41];

export function DemoMap({ lit }) {
  const { lang } = useLang();
  const scoreTextCls = (s) => (s >= 80 ? "text-verdict-go" : s >= 60 ? "text-verdict-pilot" : "text-verdict-nogo");
  const barCls = (s) => (s >= 80 ? "bg-verdict-go" : s >= 60 ? "bg-verdict-pilot" : "bg-verdict-nogo");
  return (
    <div className="w-full max-w-md">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {CITY.name[lang]}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {TILES.map((tile, i) => {
          const on = i < lit;
          return (
            <div
              key={tile.name}
              className={`rounded-md border p-3 transition-all duration-500 ${
                on ? "border-border bg-secondary opacity-100" : "border-border/50 opacity-25"
              }`}
            >
              <p className="truncate text-[11px]">{lang === "vi" ? tile.vi : tile.name}</p>
              <p className={`mt-1 font-mono text-lg ${on ? scoreTextCls(SCORES[i]) : "text-muted-foreground/30"}`}>
                {on ? SCORES[i] : "··"}
              </p>
              <div className="mt-1.5 h-0.5 rounded-full bg-border">
                <div
                  className={`h-0.5 rounded-full transition-all duration-500 ${on ? barCls(SCORES[i]) : ""}`}
                  style={{ width: on ? `${SCORES[i]}%` : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const LINE_WIDTHS = ["92%", "78%", "85%", "60%", "88%", "46%"];

export function DemoMemo({ lit }) {
  const { t } = useLang();
  return (
    <div className="w-full max-w-md">
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("result.memo")}
          </span>
          <span
            className={`font-mono text-[10px] transition-opacity duration-500 ${
              lit >= LINE_WIDTHS.length + 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            memo.md
          </span>
        </div>
        <div className="space-y-2.5 p-4">
          {LINE_WIDTHS.map((w, i) => (
            <div
              key={i}
              className={`h-2 rounded-full bg-border transition-all duration-500 ${
                i < lit ? "opacity-100" : "opacity-20"
              }`}
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
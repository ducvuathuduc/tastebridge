import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { agents } from "@/lib/agentsData";
import FadeUp from "@/components/FadeUp";

const NODES = [
  { labelKey: "diagram.n1", descKey: "diagram.d1" },
  { labelKey: "diagram.n2", descKey: "diagram.d2" },
  { labelKey: "diagram.n3", descKey: "diagram.d3" },
  { labelKey: "diagram.n4", descKey: "diagram.d4" },
  { labelKey: "diagram.n5", descKey: "diagram.d5" },
];

function PreviewBrand() {
  const { t } = useLang();
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {t("analyze.brand")}
      </p>
      <div className="mt-2 flex h-10 items-center rounded-md border border-border px-3 text-xs">
        Blue Bottle Coffee
      </div>
      <div className="mt-3 flex gap-2">
        {["Ho Chi Minh City", "Coffee & Tea"].map((chip) => (
          <span
            key={chip}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function PreviewQloo() {
  const { t } = useLang();
  const rows = [
    "Matched entity: Blue Bottle Coffee",
    "Related brands · affinity 0.82",
    "8 popular hotspots in HCMC",
  ];
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {t("result.evidence")}
      </p>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div
            key={row}
            className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-verdict-go" />
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewAgents() {
  const { lang } = useLang();
  return (
    <ol className="space-y-2">
      {agents.slice(0, 3).map((a, i) => (
        <li key={a.id} className="flex items-center gap-2.5 text-xs">
          <span className="font-mono text-[10px] text-muted-foreground">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          {a.name[lang]}
        </li>
      ))}
      <li className="pt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
        + 8 more
      </li>
    </ol>
  );
}

function PreviewVerdict() {
  const { t } = useLang();
  return (
    <div>
      <span className="inline-flex items-center rounded-md border border-verdict-pilot/40 bg-verdict-pilot/10 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-verdict-pilot">
        PILOT
      </span>
      <div className="mt-4 space-y-2">
        {[
          { label: t("result.confidence"), value: 85 },
          { label: t("result.opportunity"), value: 72 },
        ].map((b) => (
          <div key={b.label}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {b.label}
            </p>
            <div className="mt-1 h-1 rounded-full bg-border">
              <div className="h-1 rounded-full bg-verdict-pilot" style={{ width: `${b.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewPartners() {
  const { t } = useLang();
  const rows = [
    { name: "Saigon Co.op", role: "Retail distribution", fit: 78 },
    { name: "Shopee", role: "E-commerce launchpad", fit: 84 },
  ];
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {t("result.partners")}
      </p>
      <div className="mt-3 space-y-2">
        {rows.map((p) => (
          <div key={p.name} className="rounded-md border border-border px-3 py-2">
            <div className="flex items-baseline justify-between text-xs">
              <span>{p.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{p.fit}/100</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-border">
              <div className="h-1 rounded-full bg-foreground" style={{ width: `${p.fit}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEWS = [PreviewBrand, PreviewQloo, PreviewAgents, PreviewVerdict, PreviewPartners];

export default function HowDiagram() {
  const { t } = useLang();
  const [selected, setSelected] = useState(0);
  const Preview = PREVIEWS[selected];

  return (
    <section id="how-it-works" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("how.label")}
          </p>
        </FadeUp>
        <FadeUp delay={0.06}>
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("diagram.title")}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{t("diagram.sub")}</p>
          </div>
        </FadeUp>
        <FadeUp delay={0.12}>
          <ol className="mt-12 flex flex-wrap items-center gap-3">
            {NODES.map((n, i) => (
              <li key={n.labelKey} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm transition-colors ${
                    selected === i
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground/40"
                  }`}
                >
                  <span className="font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>
                  <span>{t(n.labelKey)}</span>
                </button>
                {i < NODES.length - 1 && (
                  <span className="hidden h-px w-6 bg-border sm:block" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </FadeUp>
        <FadeUp delay={0.18}>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-2">
            <div className="bg-background p-6">
              <Preview />
            </div>
            <div className="bg-background p-6">
              <h3 className="text-lg font-medium">{t(NODES[selected].labelKey)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(NODES[selected].descKey)}
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
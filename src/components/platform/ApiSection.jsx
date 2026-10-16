import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

const CODE = `# Analyze a market entry — live today
POST /functions/analyzeMarketEntry
Authorization: Bearer <tenant-api-key>

{
  "brandName": "Blue Bottle Coffee",
  "city": "hcmc",
  "category": "coffee_tea",
  "lang": "en"
}

# Response (truncated)
{
  "verdict": "PILOT",
  "opportunityIndex": 72,
  "affinity": { "overall": 81, "cultural": 84 },
  "agents": [ "… 11 agent outputs" ]
}

# Sample endpoints — shipping with the v1 surface
GET  /api/v1/markets              → live markets & packs
GET  /api/v1/markets/:id/packs    → data sources, language, partners
POST /api/v1/analyses             → run an 11-agent analysis
GET  /api/v1/analyses/:id         → verdict, affinity, partners
GET  /api/v1/analyses/:id/memo    → memo.md export`;

export default function ApiSection() {
  const { t } = useLang();
  return (
    <FadeUp>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {t("api.label")}
      </p>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-semibold tracking-tight">{t("api.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("api.sub")}</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="overflow-x-auto rounded-lg border border-border bg-card lg:col-span-3">
          <pre className="p-5 font-mono text-[11px] leading-relaxed text-muted-foreground">
            <code>{CODE}</code>
          </pre>
        </div>
        <div className="rounded-lg border border-border p-6 lg:col-span-2">
          <h3 className="font-medium">{t("api.multitenant.title")}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("api.multitenant.body")}
          </p>
        </div>
      </div>
    </FadeUp>
  );
}
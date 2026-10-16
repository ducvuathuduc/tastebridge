import { Plus, Trash2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { neighborhoods } from "@/lib/analyzeData";
import NeighborhoodMap from "@/components/analyze/NeighborhoodMap";
import { Chip, DemoTag, Empty, Section, Select, SITE_STATUSES } from "./shared";

export default function SitesTab({ project, act }) {
  const { t, lang } = useLang();
  const scores = project.latestVerdict?.result?.neighborhoods || [];
  const hoods = neighborhoods[project.city] || [];
  const sites = project.sites || [];
  const have = new Set(sites.map((s) => s.district));
  const ranked = [...scores].sort((a, b) => b.score - a.score);
  const hoodLabel = (name) => {
    const h = hoods.find((x) => x.name === name);
    return lang === "vi" && h ? h.vi : name;
  };

  const addSite = (s) => {
    const h = hoods.find((x) => x.name === s.name);
    act((api) => api.createItem(project.id, "sites", { city: project.city, district: s.name, lat: h?.lat ?? null, lng: h?.lng ?? null, score: s.score, note: s.note, status: "shortlist", source: "heatmap" }));
  };

  return (
    <div className="space-y-6">
      {scores.length > 0 ? <NeighborhoodMap cityId={project.city} scores={scores} /> : <Section title={t("st.heatmap")}><Empty>{t("st.noScores")}</Empty></Section>}

      {ranked.length > 0 && (
        <Section title={t("st.heatmap")}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {ranked.map((s) => (
              <li key={s.name} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                <div>
                  <p className="text-sm">
                    {hoodLabel(s.name)} <span className="font-mono text-xs text-muted-foreground">· {s.score}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.note}</p>
                </div>
                {have.has(s.name) ? (
                  <Chip tone="go">✓</Chip>
                ) : (
                  <Chip onClick={() => addSite(s)}>
                    <Plus className="h-3 w-3" /> {t("st.addSite")}
                  </Chip>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={t("st.shortlist")}>
        {sites.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-border">
            {sites.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    {hoodLabel(s.district)}
                    {s.score != null && <span className="font-mono text-xs text-muted-foreground">{t("st.score")} {s.score}</span>}
                    {s.source === "demo" && <DemoTag />}
                  </p>
                  {s.note && <p className="mt-0.5 text-xs text-muted-foreground">{s.note.startsWith("DEMO DATA") ? t("st.noScores") : s.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    className="h-8 w-40 text-xs"
                    value={s.status}
                    onChange={(e) => act((api) => api.updateItem(project.id, "sites", s.id, { status: e.target.value }))}
                    options={SITE_STATUSES.map((x) => ({ value: x, label: t(`st.status.${x}`) }))}
                  />
                  <button type="button" aria-label={t("os.delete")} className="p-1 text-muted-foreground hover:text-verdict-nogo" onClick={() => act((api) => api.deleteItem(project.id, "sites", s.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

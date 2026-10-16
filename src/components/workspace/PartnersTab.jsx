import { useEffect, useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { api as client } from "@/api/client";
import { Chip, DEAL_STAGES, DemoTag, Empty, Section } from "./shared";

export default function PartnersTab({ project, act }) {
  const { t, lang } = useLang();
  const [directory, setDirectory] = useState([]);
  const deals = project.deals || [];
  const inPipeline = new Set(deals.map((d) => d.partner_name));

  useEffect(() => {
    client.partners(project.city).then((r) => setDirectory(r.partners || [])).catch(() => setDirectory([]));
  }, [project.city]);

  const addDeal = (partner_name, partner_id = null) =>
    act((api) => api.createItem(project.id, "deals", { partner_name, partner_id, stage: "intro" }));

  const advance = (d) => {
    const order = ["intro", "termsheet", "signed"];
    const i = order.indexOf(d.stage);
    if (i < 0 || i === order.length - 1) return;
    act((api) => api.updateItem(project.id, "deals", d.id, { stage: order[i + 1] }));
  };

  return (
    <div className="space-y-6">
      <Section title={t("pt.pipeline")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DEAL_STAGES.map((stage) => (
            <div key={stage} className="rounded-lg border border-border p-3">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t(`stage.${stage}`)}</p>
              <div className="mt-3 space-y-2">
                {deals
                  .filter((d) => d.stage === stage)
                  .map((d) => (
                    <div key={d.id} className="rounded-md border border-border bg-card p-3">
                      <p className="text-sm">{d.partner_name}</p>
                      {d.note && <p className="mt-1 font-mono text-[10px] uppercase text-verdict-pilot">{d.note === "DEMO DATA" ? t("os.demoData") : d.note}</p>}
                      <div className="mt-2 flex gap-1.5">
                        {stage !== "signed" && stage !== "lost" && (
                          <Chip onClick={() => advance(d)}>
                            {t("pt.advance")} <ArrowRight className="h-3 w-3" />
                          </Chip>
                        )}
                        {stage !== "lost" && (
                          <Chip tone="nogo" onClick={() => act((api) => api.updateItem(project.id, "deals", d.id, { stage: "lost" }))}>
                            <X className="h-3 w-3" />
                          </Chip>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={t("pt.matches")}>
          {(project.matches || []).length === 0 ? (
            <Empty>{t("pt.noMatches")}</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {project.matches.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm">
                      {m.partner_name} <span className="font-mono text-xs text-muted-foreground">· {m.fit}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {m.role} — {m.why}
                    </p>
                  </div>
                  {inPipeline.has(m.partner_name) ? (
                    <Chip tone="go">{t("pt.inPipeline")}</Chip>
                  ) : (
                    <Chip onClick={() => addDeal(m.partner_name)}>
                      <Plus className="h-3 w-3" /> {t("pt.addToPipeline")}
                    </Chip>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={t("pt.directory")}>
          <ul className="divide-y divide-border">
            {directory.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    {p.name} <Chip>{p.type}</Chip> {p.is_demo && <DemoTag />}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{lang === "vi" ? p.note_vi : p.note}</p>
                </div>
                {inPipeline.has(p.name) ? (
                  <Chip tone="go">{t("pt.inPipeline")}</Chip>
                ) : (
                  <Chip onClick={() => addDeal(p.name, p.id)}>
                    <Plus className="h-3 w-3" /> {t("pt.addToPipeline")}
                  </Chip>
                )}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

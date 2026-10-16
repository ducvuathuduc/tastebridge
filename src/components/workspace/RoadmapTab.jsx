import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Chip, Input, PHASES, daysUntil, fmtDate } from "./shared";

const NEXT_STATUS = { todo: "doing", doing: "done", done: "todo" };
const STATUS_TONE = { todo: "neutral", doing: "pilot", done: "go" };

export default function RoadmapTab({ project, act }) {
  const { t, lang } = useLang();
  const [drafts, setDrafts] = useState({});
  const ms = project.milestones || [];

  const add = async (phase) => {
    const title = (drafts[phase] || "").trim();
    if (!title) return;
    setDrafts((d) => ({ ...d, [phase]: "" }));
    await act((api) => api.createItem(project.id, "milestones", { phase, department: "strategy", title, title_vi: title, status: "todo", sort: ms.length + 1 }));
  };

  const move = (m, dir) => {
    const idx = PHASES.indexOf(m.phase) + dir;
    if (idx < 0 || idx >= PHASES.length) return;
    act((api) => api.updateItem(project.id, "milestones", m.id, { phase: PHASES[idx] }));
  };

  return (
    <div>
      <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">{t("rm.hint")}</p>
      <div className="mt-5 -mx-6 overflow-x-auto px-6 pb-2">
        <div className="grid min-w-[1050px] grid-cols-5 gap-3">
          {PHASES.map((phase) => {
            const items = ms.filter((m) => m.phase === phase);
            const done = items.filter((m) => m.status === "done").length;
            return (
              <div key={phase} className={`rounded-lg border p-3 ${project.stage === phase ? "border-foreground/40" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-widest">{t(`phase.${phase}`)}</p>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {done}/{items.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {items.map((m) => {
                    const due = daysUntil(m.due_date);
                    const overdue = m.status !== "done" && due !== null && due < 0;
                    return (
                      <div key={m.id} className="rounded-md border border-border bg-card p-3">
                        <p className={`text-sm leading-snug ${m.status === "done" ? "text-muted-foreground line-through" : ""}`}>
                          {lang === "vi" && m.title_vi ? m.title_vi : m.title}
                        </p>
                        {(m.detail || m.authority) && (
                          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                            {lang === "vi" && m.detail_vi ? m.detail_vi : m.detail}
                            {m.authority ? ` · ${m.authority}` : ""}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Chip tone={STATUS_TONE[m.status]} onClick={() => act((api) => api.updateItem(project.id, "milestones", m.id, { status: NEXT_STATUS[m.status] || "todo" }))}>
                            {t(`status.${m.status}`)}
                          </Chip>
                          <Chip>{t(`dept.${m.department}`)}</Chip>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`font-mono text-[10px] ${overdue ? "text-verdict-nogo" : "text-muted-foreground"}`}>
                            {t("rm.due")} {fmtDate(m.due_date, lang)}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button type="button" aria-label="Move left" className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={phase === PHASES[0]} onClick={() => move(m, -1)}>
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" aria-label="Move right" className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={phase === PHASES[PHASES.length - 1]} onClick={() => move(m, 1)}>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" aria-label={t("os.delete")} className="rounded p-1 text-muted-foreground hover:text-verdict-nogo" onClick={() => act((api) => api.deleteItem(project.id, "milestones", m.id))}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form
                  className="mt-3 flex gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    add(phase);
                  }}
                >
                  <Input value={drafts[phase] || ""} onChange={(e) => setDrafts((d) => ({ ...d, [phase]: e.target.value }))} placeholder={t("rm.addPlaceholder")} className="h-8 text-xs" />
                  <button type="submit" aria-label={t("os.add")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border hover:bg-secondary">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import { agents } from "@/lib/agentsData";
import { upcomingAgents } from "@/lib/platformData";

export default function AgentRegistry() {
  const { t, lang } = useLang();
  const list = [
    ...agents.map((a) => ({ ...a, status: "active" })),
    ...upcomingAgents.map((a) => ({ ...a, status: "soon" })),
  ];
  return (
    <FadeUp>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {t("registry.label")}
      </p>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-semibold tracking-tight">{t("registry.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("registry.sub")}</p>
      </div>
      <div className="mt-8 divide-y divide-border rounded-lg border border-border">
        {list.map((a, i) => (
          <div key={a.id} className="flex items-center gap-4 px-6 py-3.5">
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${a.status === "soon" ? "text-muted-foreground" : ""}`}>
                {a.name[lang]}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground/70">{a.desc[lang]}</p>
            </div>
            {a.status === "active" ? (
              <span className="flex shrink-0 items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-foreground">
                <span className="h-1 w-1 rounded-full bg-verdict-go" />
                {t("registry.active")}
              </span>
            ) : (
              <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
                {t("registry.soon")}
              </span>
            )}
          </div>
        ))}
      </div>
    </FadeUp>
  );
}
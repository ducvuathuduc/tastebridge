import { useLang } from "@/lib/i18n";
import { agents } from "@/lib/agentsData";
import FadeUp from "@/components/FadeUp";

export default function AgentsGrid() {
  const { t, lang } = useLang();
  return (
    <section className="border-b border-border print:hidden">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("agents.label")}
          </p>
        </FadeUp>
        <FadeUp delay={0.06}>
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("agents.title")}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">{t("agents.sub")}</p>
          </div>
        </FadeUp>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, i) => (
            <FadeUp key={agent.id} delay={(i % 3) * 0.05} className="h-full">
              <div className="h-full rounded-lg border border-border p-6 transition-colors hover:border-foreground/25">
                <p className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-medium">{agent.name[lang]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {agent.desc[lang]}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
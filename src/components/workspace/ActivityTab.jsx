import { Bot, User, Cog } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Empty, Section, fmtDateTime } from "./shared";

export default function ActivityTab({ project }) {
  const { t, lang } = useLang();
  const items = project.activity || [];
  return (
    <Section title={t("ac.title")} hint={t("ac.hint")}>
      {items.length === 0 ? (
        <Empty />
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-5">
          {items.map((a) => {
            const Icon = a.actor.startsWith("agent") ? Bot : a.actor === "system" ? Cog : User;
            return (
              <li key={a.id} className="relative">
                <span className="absolute -left-[27px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="h-2 w-2" />
                </span>
                <p className="font-mono text-xs">
                  {a.action} <span className="text-muted-foreground">· {a.actor}</span>
                </p>
                {a.detail && <p className="mt-0.5 text-sm text-muted-foreground">{a.detail}</p>}
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{fmtDateTime(a.created_at, lang)}</p>
              </li>
            );
          })}
        </ol>
      )}
    </Section>
  );
}

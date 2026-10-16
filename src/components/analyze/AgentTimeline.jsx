import { useLang } from "@/lib/i18n";
import { agents } from "@/lib/agentsData";
import { StatusChip } from "./badges";

export default function AgentTimeline({ statuses, summaries }) {
  const { lang } = useLang();
  return (
    <ol className="divide-y divide-border rounded-lg border border-border">
      {agents.map((agent, i) => {
        const summary = summaries ? summaries[agent.id] : null;
        return (
          <li key={agent.id} className="flex items-start gap-4 px-5 py-4">
            <span className="mt-0.5 font-mono text-xs text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">{agent.name[lang]}</span>
                <StatusChip status={statuses[i]} />
              </div>
              {summary && (
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{summary}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
import { useLang } from "@/lib/i18n";
import CardShell from "./CardShell";
import { LevelChip } from "./badges";

export default function CompetitorsCard({ competitors }) {
  const { t } = useLang();
  return (
    <CardShell label={t("result.competitors")}>
      <div className="divide-y divide-border">
        {(competitors || []).map((c) => (
          <div key={c.name} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{c.name}</span>
              <LevelChip level={c.threat} />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.positioning}</p>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
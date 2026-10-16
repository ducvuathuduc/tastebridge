import { useLang } from "@/lib/i18n";
import CardShell from "./CardShell";
import { LevelChip } from "./badges";

export default function RisksCard({ risks }) {
  const { t } = useLang();
  return (
    <CardShell label={t("result.risks")}>
      <div className="divide-y divide-border">
        {(risks || []).map((r, i) => (
          <div key={i} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{r.risk}</span>
              <LevelChip level={r.severity} />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.mitigation}</p>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
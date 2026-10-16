import { useLang } from "@/lib/i18n";
import CardShell from "./CardShell";

export default function AffinityCard({ affinity }) {
  const { t } = useLang();
  const rows = [
    [t("result.overall"), affinity.overall],
    [t("aff.cultural"), affinity.cultural],
    [t("aff.audience"), affinity.audience],
    [t("aff.competition"), affinity.competition],
    [t("aff.price"), affinity.price],
  ];
  return (
    <CardShell label={t("result.affinity")} hint={t("result.affinityHint")}>
      <div className="space-y-4">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm">
              <span>{label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {Math.max(0, Math.min(100, Math.round(value || 0)))}
              </span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-border">
              <div
                className="h-1 rounded-full bg-foreground"
                style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
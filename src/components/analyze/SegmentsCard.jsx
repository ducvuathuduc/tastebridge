import { useLang } from "@/lib/i18n";
import CardShell from "./CardShell";

export default function SegmentsCard({ segments }) {
  const { t } = useLang();
  return (
    <CardShell label={t("result.segments")}>
      <div className="space-y-5">
        {(segments || []).map((s) => (
          <div key={s.name}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium">{s.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{s.appeal}</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-border">
              <div className="h-1 rounded-full bg-foreground" style={{ width: `${s.appeal}%` }} />
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.why}</p>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
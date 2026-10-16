import { useLang } from "@/lib/i18n";
import CardShell from "./CardShell";

export default function EvidenceCard({ evidence }) {
  const { t } = useLang();
  if (!evidence) return null;
  return (
    <CardShell label={t("result.evidence")} hint={t("result.evidenceHint")}>
      <div className="space-y-5">
        <p className="text-sm">
          {evidence.brandFound ? t("evidence.brandFound") : t("evidence.brandMissing")}
        </p>
        {evidence.relatedBrands?.length > 0 && (
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Qloo</p>
            <ul className="mt-2 space-y-1.5">
              {evidence.relatedBrands.slice(0, 6).map((b, i) => (
                <li key={`${b.name}-${i}`} className="flex items-center justify-between gap-4 text-sm">
                  <span className="truncate">{b.name}</span>
                  {b.affinity != null && (
                    <span className="font-mono text-xs text-muted-foreground">{b.affinity.toFixed(2)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {evidence.cityPlaces?.length > 0 && (
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {t("analyze.city")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {evidence.cityPlaces.slice(0, 8).map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
        {evidence.brandTags?.length > 0 && (
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {evidence.brandTags.slice(0, 10).map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardShell>
  );
}
import { useLang } from "@/lib/i18n";
import CardShell from "./CardShell";

export default function PartnersCard({ partners }) {
  const { t } = useLang();
  return (
    <CardShell label={t("result.partners")}>
      <div className="divide-y divide-border">
        {(partners || []).map((p, i) => (
          <div key={i} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium">{p.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{p.fit}/100</span>
            </div>
            <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-muted-foreground/70">
              {p.role}
            </p>
            <div className="mt-1.5 h-1 rounded-full bg-border">
              <div className="h-1 rounded-full bg-foreground" style={{ width: `${p.fit}%` }} />
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.why}</p>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
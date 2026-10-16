import { useLang } from "@/lib/i18n";
import StatusBadge from "@/components/StatusBadge";

export default function PackCard({ pack }) {
  const { t, lang } = useLang();
  const rows = [
    { label: t("pack.data"), value: pack.dataSources },
    { label: t("pack.language"), value: pack.language[lang] },
    { label: t("pack.partners"), value: pack.partners },
  ];
  return (
    <div className="rounded-lg border border-border p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">{pack.name[lang]}</h3>
        <StatusBadge live={pack.live} />
      </div>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
              {r.label}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
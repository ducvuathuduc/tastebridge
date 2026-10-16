import { useLang } from "@/lib/i18n";

export default function DemoBadge({ labelKey = "partners.demo" }) {
  const { t } = useLang();
  return (
    <span className="rounded-md border border-verdict-pilot/40 bg-verdict-pilot/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-verdict-pilot">
      {t(labelKey)}
    </span>
  );
}
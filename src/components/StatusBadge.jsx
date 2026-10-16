import { useLang } from "@/lib/i18n";

export default function StatusBadge({ live }) {
  const { t } = useLang();
  return live ? (
    <span className="rounded-md border border-verdict-go/40 bg-verdict-go/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-verdict-go">
      {t("markets.live")}
    </span>
  ) : (
    <span className="rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
      {t("markets.roadmap")}
    </span>
  );
}
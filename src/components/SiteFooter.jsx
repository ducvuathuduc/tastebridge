import { useLang } from "@/lib/i18n";
import BrandMark from "@/components/BrandMark";

export default function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-mono text-sm tracking-tight">TasteBridge</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>
        <div className="space-y-1 font-mono text-xs uppercase tracking-wider text-muted-foreground sm:text-right">
          <p>{t("footer.rights")}</p>
          <p>{t("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
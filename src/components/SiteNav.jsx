import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import BrandMark from "@/components/BrandMark";

export default function SiteNav() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-mono text-sm tracking-tight">TasteBridge</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          <Link to="/analyze" className="transition-colors hover:text-foreground">
            {t("nav.analyze")}
          </Link>
          <Link to="/markets" className="transition-colors hover:text-foreground">
            {t("nav.markets")}
          </Link>
          <Link to="/platform" className="transition-colors hover:text-foreground">
            {t("nav.platform")}
          </Link>
          <Link to="/partners" className="transition-colors hover:text-foreground">
            {t("nav.partners")}
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            {t("nav.pricing")}
          </Link>
          <Link to="/investors" className="transition-colors hover:text-foreground">
            {t("nav.investors")}
          </Link>
          <Link to="/about" className="transition-colors hover:text-foreground">
            {t("nav.about")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div
            className="flex h-9 items-center gap-0.5 rounded-md border border-border p-0.5 font-mono text-xs"
            role="group"
            aria-label="Language"
          >
            {["en", "vi"].map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`h-8 rounded-[5px] px-2.5 uppercase transition-colors ${
                  lang === code
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
          <Link to="/analyze" className="btn-primary hidden lg:inline-flex">
            {t("nav.cta")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            <Link
              to="/analyze"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("nav.analyze")}
            </Link>
            <Link
              to="/markets"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("nav.markets")}
            </Link>
            <Link
              to="/platform"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("nav.platform")}
            </Link>
            <Link
              to="/partners"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("nav.partners")}
            </Link>
            <Link
              to="/pricing"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("nav.pricing")}
            </Link>
            <Link
              to="/investors"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("nav.investors")}
            </Link>
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("nav.about")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
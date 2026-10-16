import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import BrandMark from "@/components/BrandMark";

const LINKS = [
  ["/analyze", "nav.analyze"],
  ["/workspace", "nav.workspace"],
  ["/localize", "nav.localize"],
  ["/markets", "nav.markets"],
  ["/platform", "nav.platform"],
  ["/partners", "nav.partners"],
  ["/pricing", "nav.pricing"],
  ["/investors", "nav.investors"],
  ["/developers", "nav.developers"],
  ["/about", "nav.about"],
];

export default function SiteNav() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) => `transition-colors hover:text-foreground ${isActive ? "text-foreground" : ""}`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-mono text-sm tracking-tight">TasteBridge</span>
        </Link>

        <nav className="hidden items-center gap-5 text-[13px] text-muted-foreground xl:flex">
          {LINKS.map(([to, key]) => (
            <NavLink key={to} to={to} className={linkClass}>
              {t(key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-9 items-center gap-0.5 rounded-md border border-border p-0.5 font-mono text-xs" role="group" aria-label="Language">
            {["en", "vi"].map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`h-8 rounded-[5px] px-2.5 uppercase transition-colors ${lang === code ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                {code}
              </button>
            ))}
          </div>
          <Link to="/analyze" className="btn-primary hidden xl:inline-flex">
            {t("nav.cta")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-border xl:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {LINKS.map(([to, key]) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { GithubIcon } from "./GithubIcon";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";

export const REPO_URL = "https://github.com/ducvuathuduc/tastebridge";

export function Nav() {
  const { t, lang, setLang } = useI18n();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/analyze", label: t.nav.analyze },
    { href: "/opportunity-index", label: t.nav.index },
    { href: "/business", label: t.nav.business },
    { href: "/architecture", label: t.nav.architecture },
  ];
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="flex items-center gap-2" aria-label="TasteBridge home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}
              className={cn("rounded-full px-3.5 py-2 text-sm font-medium transition-colors", path === l.href ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-paper-2")}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LangToggle lang={lang} setLang={setLang} />
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="hidden rounded-full p-2 text-ink-700 hover:bg-paper-2 sm:inline-flex" aria-label="GitHub repository">
            <GithubIcon />
          </a>
          <button className="rounded-full p-2 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-line bg-paper md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-6 py-3 text-sm font-medium text-ink-800 hover:bg-paper-2">{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}

function LangToggle({ lang, setLang }: { lang: "en" | "vi"; setLang: (l: "en" | "vi") => void }) {
  return (
    <div role="group" aria-label="Language" className="flex rounded-full border border-line bg-white p-0.5 text-xs font-semibold">
      {(["en", "vi"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={cn("rounded-full px-2.5 py-1 transition-colors", lang === l ? "bg-ink-900 text-paper" : "text-ink-500 hover:text-ink-900")}>
          {l === "en" ? "EN" : "VI"}
        </button>
      ))}
    </div>
  );
}

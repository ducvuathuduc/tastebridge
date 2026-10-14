"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";
import { REPO_URL } from "./Nav";

export function Footer() {
  const { t, lang } = useI18n();
  return (
    <footer className="no-print border-t border-line bg-paper-2/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-500">{t.tagline}</p>
        </div>
        <div className="text-sm text-ink-600">
          <p className="font-semibold text-ink-900">{lang === "vi" ? "Dữ liệu" : "Data"}</p>
          <p className="mt-2">{lang === "vi" ? "Khẩu vị và địa điểm từ Qloo Insights API (môi trường hackathon). Mọi số liệu đều có trong Sổ bằng chứng." : "Taste and venue data from the Qloo Insights API (hackathon environment). Every figure is listed in the Evidence ledger."}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-ink-900">{lang === "vi" ? "Dự án" : "Project"}</p>
          <ul className="mt-2 space-y-1.5 text-ink-600">
            <li><a className="hover:text-ink-900" href={REPO_URL} target="_blank" rel="noreferrer">GitHub · MIT License</a></li>
            <li><Link className="hover:text-ink-900" href="/architecture">{t.nav.architecture}</Link></li>
            <li><Link className="hover:text-ink-900" href="/business">{t.nav.business}</Link></li>
          </ul>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-ink-400">© 2026 TasteBridge · VTech Studio · Built for the Qloo Agentic Hackathon</p>
    </footer>
  );
}

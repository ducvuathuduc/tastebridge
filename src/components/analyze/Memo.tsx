"use client";
import { useI18n } from "@/lib/i18n";
import type { RunState } from "@/lib/useRun";
import { getPack } from "@/lib/markets";
import { budgetBand } from "@/lib/scoring";
import { formatMoney } from "@/lib/format";
import { Logo } from "../Logo";

/** One-page investor memo. Hidden on screen, rendered for print / Save as PDF. */
export function Memo({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  if (!run.scores || !run.input) return null;
  const pack = getPack(run.input.pack);
  const chair = run.agents.chair?.output;
  const launch = run.agents.launch?.output?.cities || [];
  const ids = [...run.input.cities].sort((a, b) => (run.scores![b]?.score ?? 0) - (run.scores![a]?.score ?? 0));
  const date = new Date().toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="print-only memo text-[11px] leading-snug text-black">
      <div className="flex items-center justify-between border-b border-black pb-2">
        <Logo />
        <div className="text-right"><p className="font-semibold">{lang === "vi" ? "Bản ghi nhớ nhà đầu tư" : "Investor memo"} · {run.input.brand}</p><p>{date} · {pack.country[lang]}</p></div>
      </div>
      {chair?.recommendation && <p className="mt-3 text-[12px] font-medium">{chair.recommendation}</p>}
      <table className="mt-3 w-full border-collapse text-left">
        <thead><tr className="border-b border-black"><th className="py-1">City</th><th>{t.run.verdict}</th><th>{t.run.score}</th><th>{t.run.confidence}</th><th>{t.run.audienceFit}</th><th>{t.run.demandProof}</th><th>{t.run.whitespace}</th><th>{t.run.budgetBand}</th></tr></thead>
        <tbody>
          {ids.map((id) => {
            const s = run.scores![id];
            const b = budgetBand(s.verdict, run.input!.budget?.amount);
            return (
              <tr key={id} className="border-b border-gray-300">
                <td className="py-1 font-semibold">{pack.cities.find((c) => c.id === id)?.name[lang]}</td>
                <td className="font-bold">{s.verdict}</td><td>{s.score}</td><td>{s.confidence}</td>
                <td>{s.parts.audienceFit.toFixed(2)}</td><td>{s.parts.demandProof.toFixed(2)}</td><td>{s.parts.whitespace.toFixed(2)}</td>
                <td>{Math.round(b.shareLo * 100)}–{Math.round(b.shareHi * 100)}%{run.input!.budget && b.lo != null ? ` (${formatMoney(b.lo, run.input!.budget.currency, lang)}–${formatMoney(b.hi!, run.input!.budget.currency, lang)})` : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-3 grid grid-cols-2 gap-4">
        {ids.map((id) => {
          const ch = chair?.cities?.find((c: any) => c.city_id === id);
          const l = launch.find((c: any) => c.city_id === id);
          return (
            <div key={id}>
              <p className="font-semibold">{pack.cities.find((c) => c.id === id)?.name[lang]}</p>
              {ch?.rationale && <p>{ch.rationale}</p>}
              {ch?.risks?.length > 0 && <p className="mt-1"><b>{t.run.risks}:</b> {ch.risks.slice(0, 3).join(" · ")}</p>}
              {l && <p className="mt-1"><b>{t.run.neighborhood}:</b> {l.neighborhood} · {l.launch_format}</p>}
            </div>
          );
        })}
      </div>
      <p className="mt-4 border-t border-gray-400 pt-2 text-[9px] text-gray-600">
        {lang === "vi"
          ? "Điểm Taste-Fit là tổng hợp tất định từ tín hiệu Qloo Insights API (độ hợp, độ phổ biến, bản đồ nhiệt). Dải ngân sách là tỷ lệ trên ngân sách do nhà sáng lập tự nhập. Tài liệu tư vấn; cần người duyệt ký xác nhận trước khi chia sẻ."
          : "Taste-Fit Score is a deterministic composite of Qloo Insights API signals (affinity, popularity, heatmap). Budget bands are shares of the founder's own stated budget. Advisory document; requires human reviewer sign-off before sharing."}
        {" "}{run.evidence.length} Qloo evidence items · tastebridge
      </p>
    </div>
  );
}

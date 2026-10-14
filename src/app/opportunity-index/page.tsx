"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, CircleAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Card, Skeleton, VerdictPill, VERDICT_COLOR } from "@/components/ui";
import type { ScoreBreakdown } from "@/lib/types";

interface Row { brand: string; category: string; origin: string; check: string; best: { cityId: string; score: number; verdict: ScoreBreakdown["verdict"] } | null; cities: Record<string, ScoreBreakdown>; error?: string }
const CITY = { hcmc: { en: "Ho Chi Minh City", vi: "TP.HCM" }, hanoi: { en: "Hanoi", vi: "Hà Nội" }, danang: { en: "Da Nang", vi: "Đà Nẵng" } } as const;

export default function OpportunityIndex() {
  const { lang } = useI18n();
  const vi = lang === "vi";
  const [rows, setRows] = useState<Row[] | null>(null);
  const [at, setAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/opportunity-index").then((r) => r.json()).then((d) => { if (d.error) setErr(d.error); else { setRows(d.rows); setAt(d.at); } }).catch((e) => setErr(String(e)));
  }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-saffron-600">{vi ? "Công khai · cập nhật mỗi 6 giờ" : "Public · refreshed every 6 hours"}</p>
      <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-5xl">{vi ? "Chỉ số Cơ hội F&B Việt Nam" : "Vietnam F&B Opportunity Index"}</h1>
      <p className="mt-3 max-w-2xl text-ink-600">
        {vi ? "Xếp hạng các thương hiệu F&B nước ngoài chưa có mặt tại Việt Nam theo Điểm Taste-Fit cao nhất ở TP.HCM, Hà Nội và Đà Nẵng — tính trực tiếp từ Qloo, không dùng LLM."
          : "Foreign F&B brands not yet in Vietnam, ranked by their best Taste-Fit Score across Ho Chi Minh City, Hanoi and Da Nang — computed live from Qloo, no LLM involved."}
      </p>
      <Card className="mt-8 overflow-hidden p-0 sm:p-0">
        {err && <div className="flex items-center gap-2 p-6 text-sm text-nogo" role="alert"><CircleAlert className="h-4 w-4" /> {err}</div>}
        {!rows && !err && (
          <div className="space-y-3 p-6">
            <p className="text-sm text-ink-500">{vi ? "Đang tính chỉ số từ Qloo (lần đầu có thể mất ~30 giây)…" : "Computing the index from Qloo (first load can take ~30 seconds)…"}</p>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        )}
        {rows && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-paper-2 text-xs text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">{vi ? "Thương hiệu" : "Brand"}</th>
                  {(["hcmc", "hanoi", "danang"] as const).map((c) => <th key={c} className="px-3 py-3 font-medium">{CITY[c][lang]}</th>)}
                  <th className="px-3 py-3 font-medium">{vi ? "Tốt nhất" : "Best"}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r, i) => (
                  <motion.tr key={r.brand} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="hover:bg-paper">
                    <td className="px-5 py-4 font-mono text-ink-400">{i === 0 ? <Trophy className="h-4 w-4 text-saffron-600" /> : i + 1}</td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-ink-950">{r.brand}</p>
                      <p className="text-xs text-ink-500">{r.category} · {r.origin} · {r.check === "web+qloo" ? (vi ? "đã kiểm tra web + Qloo" : "web + Qloo checked") : (vi ? "Qloo: chưa có điểm bán VN" : "Qloo: no VN venues")}</p>
                    </td>
                    {(["hcmc", "hanoi", "danang"] as const).map((c) => {
                      const s = r.cities[c];
                      return (
                        <td key={c} className="px-3 py-4">
                          {s ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full" style={{ width: `${s.score}%`, background: VERDICT_COLOR[s.verdict] }} /></div>
                              <span className="font-mono tabular-nums">{s.score}</span>
                            </div>
                          ) : <span className="text-ink-300">—</span>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-4">{r.best ? <div className="flex items-center gap-2"><VerdictPill verdict={r.best.verdict} /><span className="text-xs text-ink-500">{CITY[r.best.cityId as keyof typeof CITY]?.[lang]}</span></div> : <span className="text-xs text-ink-400">{r.error || "—"}</span>}</td>
                    <td className="px-5 py-4 text-right"><Link href={`/analyze?brand=${encodeURIComponent(r.brand)}`} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700 hover:text-ink-950">{vi ? "Phân tích" : "Analyze"} <ArrowRight className="h-3.5 w-3.5" /></Link></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="mt-4 text-xs text-ink-500">
        {vi ? "Phương pháp: Điểm Taste-Fit = 50% độ hợp tệp khách + 30% bằng chứng nhu cầu + 20% khoảng trống, từ Qloo Insights (place, filter.tags, heatmap). Trạng thái 'chưa có ở Việt Nam' được kiểm tra ngày 14/10/2026." : "Method: Taste-Fit = 50% audience fit + 30% demand proof + 20% white space, from Qloo Insights (place, filter.tags, heatmap). 'Not in Vietnam' status checked on 2026-10-14."}
        {at ? ` · ${vi ? "Tính lúc" : "Computed"} ${new Date(at).toLocaleString(vi ? "vi-VN" : "en-US")}` : ""}
      </p>
    </div>
  );
}

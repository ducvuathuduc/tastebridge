"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Flame } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { RunState } from "@/lib/useRun";
import { getPack } from "@/lib/markets";
import { bestNeighborhood } from "@/lib/scoring";
import { Card, SectionTitle, Skeleton } from "../ui";
import { cn } from "@/lib/cn";

const Inner = dynamic(() => import("./HeatMapInner"), { ssr: false, loading: () => <Skeleton className="h-[380px] sm:h-[440px]" /> });

export function HeatMap({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const pack = getPack(run.input?.pack);
  const ids = (run.input?.cities || []).filter((id) => run.cities[id]);
  const [sel, setSel] = useState<string | null>(null);
  const active = sel && run.cities[sel] ? sel : ids[0];
  if (!active) {
    return <Card><SectionTitle icon={Flame}>{t.run.heatmap}</SectionTitle><Skeleton className="h-[380px]" /></Card>;
  }
  const city = run.cities[active];
  const meta = pack.cities.find((c) => c.id === active)!;
  const bn = bestNeighborhood(city);
  return (
    <Card id="heatmap">
      <SectionTitle icon={Flame} hint={lang === "vi" ? "Ô nhiệt: độ hợp khẩu vị Qloo · chấm đen: địa điểm hợp khẩu vị" : "Circles: Qloo taste affinity · dark dots: taste-matched venues"}>{t.run.heatmap}</SectionTitle>
      <div role="tablist" className="mb-3 flex flex-wrap gap-2">
        {ids.map((id) => (
          <button key={id} role="tab" aria-selected={id === active} onClick={() => setSel(id)}
            className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", id === active ? "bg-ink-900 text-paper" : "bg-paper-2 text-ink-600 hover:text-ink-900")}>
            {pack.cities.find((c) => c.id === id)?.name[lang]}
          </button>
        ))}
      </div>
      {city.heat.length ? <Inner city={city} center={meta.center} venueLabel={t.run.matched} /> : (
        <div className="grid h-[200px] place-items-center rounded-2xl bg-paper-2 text-sm text-ink-500">{lang === "vi" ? "Qloo chưa có dữ liệu bản đồ nhiệt cho thành phố này." : "Qloo returned no heatmap cells for this city."}</div>
      )}
      {bn && (
        <p className="mt-3 text-sm text-ink-700">
          <b>{t.run.neighborhood}:</b> {bn.neighborhood || "—"} {bn.nearestPlace && <span className="text-ink-500">({lang === "vi" ? "gần" : "near"} {bn.nearestPlace})</span>} · <span className="font-mono text-xs">affinity {bn.cell.affinity.toFixed(2)}</span>
        </p>
      )}
    </Card>
  );
}

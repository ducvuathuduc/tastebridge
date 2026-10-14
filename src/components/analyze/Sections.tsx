"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Gavel, TrendingUp, TrendingDown, Rocket, Megaphone, Handshake, Music, ChefHat, Database, UserRound, CalendarDays, Activity } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { RunState } from "@/lib/useRun";
import { getPack } from "@/lib/markets";
import { Card, Chip, SectionTitle, Skeleton } from "../ui";
import { cn } from "@/lib/cn";

const cityName = (run: RunState, id: string, lang: "en" | "vi") => getPack(run.input?.pack).cities.find((c) => c.id === id)?.name[lang] || id;

/* ───────── Brand profile + demographics ───────── */
export function ProfileCard({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const p = run.profile;
  if (!p) return <Card><Skeleton className="h-24" /></Card>;
  const age = p.demographics?.age || {};
  const gender = p.demographics?.gender || {};
  const max = Math.max(0.01, ...Object.values(age).map((v) => Math.abs(v)));
  return (
    <Card>
      <SectionTitle icon={UserRound}>{p.name}</SectionTitle>
      {p.summary && <p className="text-sm leading-relaxed text-ink-700">{p.summary}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {p.anchors.map((a) => <Chip key={a.id}>{a.name}{a.address ? ` · ${a.address.split(",").slice(-2).join(",").trim().slice(0, 32)}` : ""}</Chip>)}
        {p.tags.map((tg) => <Chip key={tg.id} className="bg-saffron-100">#{tg.name}</Chip>)}
      </div>
      {Object.keys(age).length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-ink-700">{t.run.demographics}</p>
          <div className="mt-2 grid grid-cols-6 items-end gap-2" role="img" aria-label="Age affinity chart">
            {Object.entries(age).map(([k, v]) => (
              <div key={k} className="flex flex-col items-center">
                <div className="relative flex h-20 w-full items-center justify-center">
                  <span className="absolute left-0 right-0 top-1/2 h-px bg-line" />
                  <motion.span className={cn("absolute w-5 rounded", v >= 0 ? "bottom-1/2 bg-go" : "top-1/2 bg-nogo")} initial={{ height: 0 }} animate={{ height: `${(Math.abs(v) / max) * 50}%` }} />
                </div>
                <span className="mt-1 font-mono text-[10px] text-ink-900">{v > 0 ? "+" : ""}{v.toFixed(2)}</span>
                <span className="text-[10px] text-ink-500">{k.replace(/_/g, " ").replace("and younger", "↓").replace("and older", "+")}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-600">{Object.entries(gender).map(([k, v]) => `${k} ${v > 0 ? "+" : ""}${v.toFixed(2)}`).join(" · ")}</p>
        </div>
      )}
    </Card>
  );
}

/* ───────── Bull vs Bear ───────── */
export function Committee({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const bull = run.agents.bull?.output?.cities || [];
  const bear = run.agents.bear?.output?.cities || [];
  if (!bull.length && !bear.length) return run.status === "running" ? <Card><SectionTitle icon={Gavel}>{t.run.bull} vs {t.run.bear}</SectionTitle><Skeleton className="h-40" /></Card> : null;
  const ids = run.input?.cities || [];
  return (
    <Card>
      <SectionTitle icon={Gavel}>{t.run.bull} vs {t.run.bear}</SectionTitle>
      <div className="space-y-4">
        {ids.map((id) => {
          const b = bull.find((c: any) => c.city_id === id)?.points || [];
          const r = bear.find((c: any) => c.city_id === id)?.points || [];
          return (
            <div key={id}>
              <p className="mb-2 text-sm font-semibold">{cityName(run, id, lang)}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-go/20 bg-go-soft/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-go"><TrendingUp className="h-3.5 w-3.5" /> {t.run.bull}</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-ink-700">{b.map((x: string, i: number) => <li key={i}>• {x}</li>)}</ul>
                </div>
                <div className="rounded-xl border border-nogo/20 bg-nogo-soft/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-nogo"><TrendingDown className="h-3.5 w-3.5" /> {t.run.bear}</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-ink-700">{r.map((x: string, i: number) => <li key={i}>• {x}</li>)}</ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ───────── A–Z Launch plan ───────── */
export function LaunchPlan({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const out = run.agents.launch?.output?.cities || [];
  const [tab, setTab] = useState(0);
  if (!out.length) return run.status === "running" ? <Card><SectionTitle icon={Rocket}>{t.run.launch}</SectionTitle><Skeleton className="h-48" /></Card> : null;
  const c = out[Math.min(tab, out.length - 1)];
  return (
    <Card id="launch">
      <SectionTitle icon={Rocket} hint={lang === "vi" ? "Chỉ cho các thành phố GO / PILOT" : "GO / PILOT cities only"}>{t.run.launch}</SectionTitle>
      <div role="tablist" className="mb-4 flex flex-wrap gap-2">
        {out.map((x: any, i: number) => (
          <button key={x.city_id} role="tab" aria-selected={i === tab} onClick={() => setTab(i)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", i === tab ? "bg-ink-900 text-paper" : "bg-paper-2 text-ink-600")}>{cityName(run, x.city_id, lang)}</button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-3 text-sm">
          <div className="rounded-xl bg-paper p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-saffron-600">{t.run.neighborhood}</p>
            <p className="mt-1 font-display text-xl font-semibold">{c.neighborhood}</p>
            <p className="mt-1 text-ink-600">{c.why_here}</p>
            {c.launch_format && <Chip className="mt-2">{c.launch_format}</Chip>}
          </div>
          {c.marketing?.length > 0 && <List title="Marketing" items={c.marketing} />}
          {c.kol_collabs?.length > 0 && <List title="KOL / collabs" items={c.kol_collabs} />}
          {c.monitoring?.length > 0 && <List title={t.run.monitoring} items={c.monitoring} icon={Activity} />}
        </div>
        <ol className="relative space-y-3">
          {(c.timeline || []).map((ph: any, i: number) => (
            <motion.li key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl border border-line bg-white p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-ink-900"><CalendarDays className="h-3.5 w-3.5 text-saffron-600" /> {ph.phase}</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-700">{(ph.actions || []).map((a: string, k: number) => <li key={k}>• {a}</li>)}</ul>
            </motion.li>
          ))}
        </ol>
      </div>
    </Card>
  );
}

function List({ title, items, icon: Icon }: { title: string; items: string[]; icon?: any }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-800">{Icon && <Icon className="h-3.5 w-3.5 text-saffron-600" />}{title}</p>
      <ul className="mt-1.5 space-y-1 text-sm text-ink-600">{items.map((x, i) => <li key={i}>• {x}</li>)}</ul>
    </div>
  );
}

/* ───────── Demand validation: landing preview + ads ───────── */
export function Validate({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const o = run.agents.validate?.output;
  const [showEn, setShowEn] = useState(false);
  if (!o?.landing) return run.status === "running" ? <Card><SectionTitle icon={Megaphone}>{t.run.validate}</SectionTitle><Skeleton className="h-56" /></Card> : null;
  const L = o.landing;
  return (
    <Card id="validate">
      <SectionTitle icon={Megaphone} hint={cityName(run, o.city_id, lang)}>{t.run.validate}</SectionTitle>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="mx-auto w-full max-w-[320px]">
          <div className="rounded-[2.2rem] border-[10px] border-ink-950 bg-white shadow-[var(--shadow-lift)]">
            <div className="rounded-[1.6rem] bg-gradient-to-b from-saffron-100 to-white p-5" aria-label={t.run.landing}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-saffron-600">{run.input?.brand} · {cityName(run, o.city_id, lang)}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-ink-950">{showEn ? L.headline_en : L.headline_local}</h3>
              {!showEn && <p className="mt-2 text-sm text-ink-600">{L.subhead_local}</p>}
              <ul className="mt-4 space-y-1.5 text-sm text-ink-800">{(L.bullets_local || []).map((b: string, i: number) => <li key={i}>✓ {b}</li>)}</ul>
              {L.offer && <p className="mt-4 rounded-lg bg-white p-2 text-xs text-ink-700">🎁 {L.offer}</p>}
              <button className="mt-5 w-full rounded-full bg-ink-900 py-3 text-sm font-semibold text-paper" type="button" tabIndex={-1}>{L.cta_local}</button>
            </div>
          </div>
          <button onClick={() => setShowEn(!showEn)} className="mx-auto mt-3 block text-xs font-medium text-ink-500 underline-offset-2 hover:underline">{showEn ? "Tiếng Việt" : "English"}</button>
        </div>
        <div>
          <p className="text-sm font-semibold">{t.run.ads}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {(o.ads || []).map((ad: any, i: number) => (
              <div key={i} className="rounded-xl border border-line bg-paper p-4 text-sm">
                <Chip className="bg-white">{ad.channel}</Chip>
                <p className="mt-2 font-medium text-ink-900">{ad.copy_local}</p>
                <p className="mt-1 text-xs text-ink-500">{ad.copy_en}</p>
                {ad.audience && <p className="mt-2 text-[11px] text-ink-500">🎯 {ad.audience}</p>}
              </div>
            ))}
          </div>
          {o.success_metric && <p className="mt-4 rounded-xl bg-go-soft p-3 text-sm text-go">{o.success_metric}</p>}
        </div>
      </div>
    </Card>
  );
}

/* ───────── Partner match ───────── */
export function Partners({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const roles = run.agents.partners?.output?.roles || [];
  const pack = getPack(run.input?.pack);
  if (!roles.length) return run.status === "running" ? <Card><SectionTitle icon={Handshake}>{t.run.partners}</SectionTitle><Skeleton className="h-40" /></Card> : null;
  return (
    <Card id="partners">
      <SectionTitle icon={Handshake} hint={lang === "vi" ? "Hồ sơ đối tác, không nêu tên công ty thật" : "Partner profiles — no company names invented"}>{t.run.partners}</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[...roles].sort((a: any, b: any) => (a.priority ?? 9) - (b.priority ?? 9)).map((r: any) => {
          const def = pack.partnerRoles.find((x) => x.id === r.role_id);
          return (
            <div key={r.role_id} className="rounded-xl border border-line bg-paper p-4 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{def?.name[lang] || r.role_id}</p>
                <span className="rounded-full bg-ink-900 px-2 py-0.5 font-mono text-[10px] text-paper">P{r.priority}</span>
              </div>
              <p className="mt-2 text-ink-600">{r.brief}</p>
              {r.must_have?.length > 0 && <ul className="mt-2 space-y-0.5 text-xs text-ink-700">{r.must_have.map((m: string, i: number) => <li key={i}>✓ {m}</li>)}</ul>}
              {r.red_flags?.length > 0 && <ul className="mt-2 space-y-0.5 text-xs text-nogo">{r.red_flags.map((m: string, i: number) => <li key={i}>⚑ {m}</li>)}</ul>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ───────── Culture map + localization ───────── */
export function CultureMenu({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const ids = (run.input?.cities || []).filter((id) => run.cities[id]);
  const angles = run.agents.culture?.output?.angles || [];
  const loc = run.agents.localize?.output?.cities || [];
  const [tab, setTab] = useState(0);
  if (!ids.length) return null;
  const id = ids[Math.min(tab, ids.length - 1)];
  const c = run.cities[id];
  const ang = angles.find((a: any) => a.city_id === id);
  const lz = loc.find((a: any) => a.city_id === id);
  const domains: [string, string][] = [["artist", "🎵"], ["tv_show", "📺"], ["brand", "🛍️"], ["movie", "🎬"], ["person", "⭐"], ["podcast", "🎙️"]];
  return (
    <Card>
      <SectionTitle icon={Music}>{t.run.culture} · {t.run.menu}</SectionTitle>
      <div role="tablist" className="mb-4 flex flex-wrap gap-2">
        {ids.map((x, i) => <button key={x} role="tab" aria-selected={i === tab} onClick={() => setTab(i)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", i === tab ? "bg-ink-900 text-paper" : "bg-paper-2 text-ink-600")}>{cityName(run, x, lang)}</button>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          {domains.filter(([d]) => c.culture[d]?.length).map(([d, e]) => (
            <div key={d} className="mb-3">
              <p className="text-xs font-semibold text-ink-700">{e} {d.replace("_", " ")}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">{c.culture[d].slice(0, 8).map((x) => <Chip key={x.name}>{x.name}{x.affinity != null && <span className="ml-1 font-mono text-[10px] text-ink-400">{x.affinity.toFixed(2)}</span>}</Chip>)}</div>
            </div>
          ))}
          {ang && <div className="mt-3 rounded-xl bg-saffron-100 p-4 text-sm"><p className="font-semibold">{ang.angle}</p>{ang.collab && <p className="mt-1 text-ink-700">🤝 {ang.collab}</p>}{ang.kol_profile && <p className="mt-1 text-ink-700">🎤 {ang.kol_profile}</p>}</div>}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-700"><ChefHat className="h-3.5 w-3.5 text-saffron-600" /> {t.run.localTaste}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{c.localTaste.map((x) => <Chip key={x.tag} className="bg-white">{x.tag} <span className="ml-1 font-mono text-[10px] text-ink-400">×{x.count}</span></Chip>)}</div>
          {Object.keys(c.priceLevels).length > 0 && <p className="mt-2 text-xs text-ink-500">{lang === "vi" ? "Mức giá Qloo của địa điểm hợp khẩu vị" : "Qloo price levels of matched venues"}: {Object.entries(c.priceLevels).sort().map(([k, v]) => `${"$".repeat(Number(k))}×${v}`).join("  ")}</p>}
          {lz && (
            <div className="mt-4 rounded-xl border border-line bg-paper p-4 text-sm">
              <p className="font-semibold">{lz.positioning}</p>
              {lz.price_tier && <Chip className="mt-2 bg-white">{lz.price_tier}</Chip>}
              <ul className="mt-2 space-y-1 text-ink-700">{(lz.menu_tweaks || []).map((m: string, i: number) => <li key={i}>• {m}</li>)}</ul>
              {lz.rationale && <p className="mt-2 text-xs text-ink-500">{lz.rationale}</p>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ───────── Evidence ledger ───────── */
export function EvidenceLedger({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  if (!run.evidence.length) return null;
  const rows = open ? run.evidence : run.evidence.slice(0, 8);
  return (
    <Card id="evidence">
      <SectionTitle icon={Database} hint={`${run.evidence.length} ${lang === "vi" ? "mục" : "items"}`}>{t.run.evidence}</SectionTitle>
      <p className="mb-3 text-xs text-ink-500">{t.run.evidenceHelp}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-ink-500"><tr><th className="py-2 pr-3 font-medium">ID</th><th className="py-2 pr-3 font-medium">{lang === "vi" ? "Chỉ số" : "Metric"}</th><th className="py-2 pr-3 font-medium">{lang === "vi" ? "Thành phố" : "City"}</th><th className="py-2 pr-3 font-medium">{lang === "vi" ? "Giá trị" : "Value"}</th><th className="py-2 font-medium">Qloo request</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="py-2 pr-3 font-mono text-ink-400">{e.id}</td>
                <td className="py-2 pr-3 text-ink-800">{e.label}</td>
                <td className="py-2 pr-3 text-ink-600">{e.city ? cityName(run, e.city, lang) : "—"}</td>
                <td className="py-2 pr-3 font-mono tabular-nums text-ink-900">{String(e.value)}</td>
                <td className="max-w-[340px] truncate py-2 font-mono text-[10px] text-ink-400" title={e.source}>{decodeURIComponent(e.source)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {run.evidence.length > 8 && <button onClick={() => setOpen(!open)} className="mt-3 text-xs font-semibold text-ink-700 hover:underline">{open ? "−" : `+ ${run.evidence.length - 8}`}</button>}
    </Card>
  );
}

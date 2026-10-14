"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Database, Scale, Rocket } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AgentConstellation } from "@/components/AgentConstellation";
import { AGENT_META } from "@/components/agentMeta";

export default function Home() {
  const { t, lang } = useI18n();
  const vi = lang === "vi";
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grain absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-20">
          <div>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-medium text-ink-700">
              <Sparkles className="h-3.5 w-3.5 text-saffron-600" /> {t.heroKicker}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="font-display mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
              {t.heroTitle}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
              {t.heroSub}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-8 flex flex-wrap gap-3">
              <Link href="/analyze" className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-sm font-semibold text-paper shadow-[var(--shadow-card)] transition hover:bg-ink-800">
                {t.ctaStart} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link href="/opportunity-index" className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink-900 hover:border-ink-400">
                {t.ctaIndex}
              </Link>
            </motion.div>
            <p className="mt-6 text-sm font-medium text-saffron-600">{t.tagline}</p>
          </div>
          <AgentConstellation />
        </div>
      </section>

      {/* VALUE STREAM */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display max-w-2xl text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">{t.howTitle}</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {t.stepsTitle.map((s, i) => (
              <motion.li key={s} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="relative rounded-[var(--radius-card)] border border-line bg-paper p-5">
                <span className="font-mono text-xs text-saffron-600">0{i + 1}</span>
                <h3 className="mt-1 font-display text-xl font-semibold">{s}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{t.steps[i]}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* AGENTS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{vi ? "Hội đồng 11 tác tử" : "The eleven-agent committee"}</h2>
          <p className="max-w-md text-sm text-ink-500">{vi ? "Mỗi tác tử gọi công cụ Qloo bằng function calling gốc. Điểm số do mô hình tất định tính, không phải LLM." : "Each agent calls Qloo tools through native function calling. Scores come from a deterministic model, never from the LLM."}</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AGENT_META.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
              className="group rounded-[var(--radius-card)] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: a.tint }}><a.icon className="h-4.5 w-4.5 text-ink-900" /></span>
                <h3 className="font-semibold">{a.name[lang]}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{a.role[lang]}</p>
              {a.tools.length > 0 && <p className="mt-3 font-mono text-[11px] text-ink-400">{a.tools.join(" · ")}</p>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-ink-950 text-paper">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
          {[
            { icon: Database, h: vi ? "Không bịa số liệu" : "No invented numbers", p: vi ? "Mọi con số hiển thị đều nằm trong Sổ bằng chứng kèm truy vấn Qloo gốc." : "Every figure on screen sits in the Evidence ledger next to the Qloo request it came from." },
            { icon: Scale, h: vi ? "Hội đồng lạc quan vs thận trọng" : "Bull vs bear, then a chair", p: vi ? "Hai tác tử tranh luận, chủ tịch ra phán quyết; điểm số tất định và minh bạch." : "Two agents argue, a chair rules; the score is deterministic and transparent." },
            { icon: ShieldCheck, h: vi ? "Con người ký duyệt" : "Human sign-off", p: vi ? "Phán quyết là tư vấn; người duyệt xác nhận trước khi chia sẻ với nhà đầu tư." : "Verdicts are advisory; a reviewer signs off before anything is shared with investors." },
          ].map((x) => (
            <div key={x.h}>
              <x.icon className="h-6 w-6 text-saffron-500" />
              <h3 className="mt-3 font-display text-xl font-semibold">{x.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{x.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <Rocket className="mx-auto h-8 w-8 text-saffron-600" />
        <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{t.tagline}</h2>
        <Link href="/analyze" className="mt-8 inline-flex items-center gap-2 rounded-full bg-saffron-500 px-7 py-3.5 text-sm font-semibold text-ink-950 hover:bg-saffron-300">
          {t.ctaStart} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}

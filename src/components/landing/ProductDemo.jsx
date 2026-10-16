import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import {
  DemoBrand,
  DemoAgents,
  DemoVerdict,
  DemoMap,
  DemoMemo,
} from "@/components/landing/DemoStages";

const TICK_MS = 650;
const BRAND_END = 6; // ticks 0-5: brand typing
const AGENTS_END = 17; // ticks 6-16: 11 agents light up
const VERDICT_END = 20; // ticks 17-19: badge, bars, headline
const MAP_END = 26; // ticks 20-25: heatmap tiles fill
const TOTAL = 35; // ticks 26-34: memo generates, holds, loops

export default function ProductDemo() {
  const { t } = useLang();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => (x + 1) % TOTAL), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const stage = tick < BRAND_END ? 0 : tick < AGENTS_END ? 1 : tick < VERDICT_END ? 2 : tick < MAP_END ? 3 : 4;
  const stageLabels = ["demo.s1", "demo.s2", "demo.s3", "demo.s4", "demo.s5"];

  return (
    <section id="demo" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("demo.label")}
          </p>
        </FadeUp>
        <FadeUp delay={0.06}>
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("demo.title")}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{t("demo.sub")}</p>
          </div>
        </FadeUp>
        <FadeUp delay={0.12}>
          <div className="mt-12 overflow-hidden rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="ml-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                taste-bridge.app/analyze
              </span>
            </div>
            <div className="h-[380px] p-5 sm:h-[420px]">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex h-full items-center justify-center"
              >
                {stage === 0 && <DemoBrand progress={tick / (BRAND_END - 1)} done={tick >= BRAND_END - 1} />}
                {stage === 1 && <DemoAgents lit={Math.min(11, tick - BRAND_END + 1)} />}
                {stage === 2 && <DemoVerdict step={Math.min(2, tick - AGENTS_END)} />}
                {stage === 3 && <DemoMap lit={Math.min(6, tick - VERDICT_END + 1)} />}
                {stage === 4 && <DemoMemo lit={Math.min(7, tick - MAP_END + 1)} />}
              </motion.div>
            </div>
          </div>
        </FadeUp>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          {stageLabels.map((key, i) => (
            <span
              key={key}
              className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider ${
                i === stage
                  ? "text-foreground"
                  : i < stage
                    ? "text-muted-foreground"
                    : "text-muted-foreground/40"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  i === stage
                    ? "bg-foreground"
                    : i < stage
                      ? "bg-muted-foreground"
                      : "bg-muted-foreground/30"
                }`}
              />
              {t(key)}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground/60">{t("demo.note")}</p>
        <FadeUp delay={0.18}>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/analyze?sample=1" className="btn-primary h-11 px-6">
              <Play className="h-4 w-4" />
              {t("cta.sample")}
            </Link>
            <Link to="/analyze" className="btn-secondary h-11 px-6">
              {t("cta.ownBrand")}
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
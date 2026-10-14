"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ScoreBreakdown } from "@/lib/types";

export function Card({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  return <section id={id} className={cn("rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6", className)}>{children}</section>;
}

export function SectionTitle({ icon: Icon, children, hint }: { icon?: any; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink-950">
        {Icon && <Icon className="h-5 w-5 text-saffron-600" aria-hidden />} {children}
      </h2>
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

const VERDICT_STYLE: Record<ScoreBreakdown["verdict"], string> = {
  GO: "bg-go-soft text-go ring-go/20",
  PILOT: "bg-pilot-soft text-pilot ring-pilot/20",
  "NO-GO": "bg-nogo-soft text-nogo ring-nogo/20",
};
export const VERDICT_COLOR: Record<ScoreBreakdown["verdict"], string> = { GO: "#13795b", PILOT: "#b26b00", "NO-GO": "#b42318" };

export function VerdictPill({ verdict, size = "md" }: { verdict: ScoreBreakdown["verdict"]; size?: "md" | "lg" }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide ring-1", VERDICT_STYLE[verdict], size === "lg" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> {verdict}
    </span>
  );
}

export function ScoreRing({ score, verdict, size = 92 }: { score: number; verdict: ScoreBreakdown["verdict"]; size?: number }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Taste-Fit Score ${score} of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#edf0f5" strokeWidth="7" fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={VERDICT_COLOR[verdict]} strokeWidth="7" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - score / 100) }} transition={{ duration: 1.1, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-2xl font-semibold tabular-nums text-ink-950">{score}</span>
      </div>
    </div>
  );
}

export function Bar({ value, label, color = "#e8a33d" }: { value: number; label: string; color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="text-ink-600">{label}</span><span className="font-mono tabular-nums text-ink-900">{value.toFixed(2)}</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} aria-hidden />;
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full border border-line bg-paper px-2.5 py-1 text-xs text-ink-700", className)}>{children}</span>;
}

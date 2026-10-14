"use client";
import { motion, useReducedMotion } from "framer-motion";
import { AGENT_META } from "./agentMeta";
import { useI18n } from "@/lib/i18n";

/** Decorative hero visual: the agent committee orbiting Qloo's taste graph. No data shown. */
export function AgentConstellation() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const R = 150;
  const nodes = AGENT_META.map((a, i) => {
    const ang = (i / AGENT_META.length) * Math.PI * 2 - Math.PI / 2;
    return { ...a, x: 200 + R * Math.cos(ang), y: 200 + R * Math.sin(ang) };
  });
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden>
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-saffron-100 via-white to-ink-100 blur-2xl" />
      <svg viewBox="0 0 400 400" className="relative h-full w-full">
        <circle cx="200" cy="200" r={R} fill="none" stroke="#e6dfd0" strokeDasharray="3 6" />
        <circle cx="200" cy="200" r="92" fill="none" stroke="#e6dfd0" />
        {nodes.map((n, i) => (
          <motion.line key={`l-${n.id}`} x1="200" y1="200" x2={n.x} y2={n.y} stroke="#e8a33d" strokeWidth="1.2"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 0.8, 0.25] }}
            transition={{ delay: 0.3 + i * 0.12, duration: 1.4, repeat: reduce ? 0 : Infinity, repeatDelay: AGENT_META.length * 0.12 + 1.5 }} />
        ))}
        <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ transformOrigin: "200px 200px" }}>
          <circle cx="200" cy="200" r="54" fill="#111a2c" />
          <text x="200" y="196" textAnchor="middle" fill="#fbf8f2" fontSize="15" fontWeight="600" fontFamily="var(--font-fraunces)">Qloo</text>
          <text x="200" y="214" textAnchor="middle" fill="#f5cf8e" fontSize="9.5" letterSpacing="1.5">TASTE GRAPH</text>
        </motion.g>
        {nodes.map((n, i) => (
          <motion.g key={n.id} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 180 }} style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
            <circle cx={n.x} cy={n.y} r="19" fill="white" stroke="#e6dfd0" />
            <circle cx={n.x} cy={n.y} r="14" fill={n.tint} />
            <foreignObject x={n.x - 8} y={n.y - 8} width="16" height="16"><n.icon width={16} height={16} color="#111a2c" /></foreignObject>
            <text x={n.x} y={n.y + (n.y > 200 ? 33 : -26)} textAnchor="middle" fontSize="9.5" fill="#2a3854" fontWeight="500">{n.name[lang]}</text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

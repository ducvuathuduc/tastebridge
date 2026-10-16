import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

const NODE_KEYS = ["fly.n1", "fly.n2", "fly.n3", "fly.n4", "fly.n5", "fly.n6"];
const R = 36;

export default function Flywheel() {
  const { t } = useLang();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % NODE_KEYS.length), 1600);
    return () => clearInterval(id);
  }, []);

  const arcs = NODE_KEYS.map((_, i) => {
    const a0 = ((i * 360) / NODE_KEYS.length - 90) * (Math.PI / 180);
    const a1 = (((i + 1) * 360) / NODE_KEYS.length - 90) * (Math.PI / 180);
    const pad = 0.16;
    const x0 = 50 + R * Math.cos(a0 + pad);
    const y0 = 50 + R * Math.sin(a0 + pad);
    const x1 = 50 + R * Math.cos(a1 - pad);
    const y1 = 50 + R * Math.sin(a1 - pad);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full text-muted-foreground"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="fly-arrow"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        {arcs.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
            markerEnd="url(#fly-arrow)"
            className="transition-opacity duration-500"
            style={{ opacity: i === active ? 0.9 : 0.35 }}
          />
        ))}
      </svg>

      {NODE_KEYS.map((key, i) => {
        const angle = ((i * 360) / NODE_KEYS.length - 90) * (Math.PI / 180);
        const x = 50 + R * Math.cos(angle);
        const y = 50 + R * Math.sin(angle);
        const isActive = i === active;
        return (
          <div
            key={key}
            className="absolute w-[28%] -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span
              className={`mx-auto mb-1.5 block h-2.5 w-2.5 rounded-sm transition-colors duration-500 ${
                isActive ? "bg-foreground" : "bg-muted-foreground/40"
              }`}
            />
            <p
              className={`text-[11px] leading-snug transition-colors duration-500 ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {t(key)}
            </p>
          </div>
        );
      })}

      <div className="absolute left-1/2 top-1/2 w-[26%] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          {t("fly.hub")}
        </p>
      </div>
    </div>
  );
}
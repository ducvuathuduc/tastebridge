import { Check, Loader2, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const verdictStyles = {
  GO: {
    text: "text-verdict-go",
    dot: "bg-verdict-go",
    badge: "border-verdict-go/40 bg-verdict-go/10",
  },
  PILOT: {
    text: "text-verdict-pilot",
    dot: "bg-verdict-pilot",
    badge: "border-verdict-pilot/40 bg-verdict-pilot/10",
  },
  "NO-GO": {
    text: "text-verdict-nogo",
    dot: "bg-verdict-nogo",
    badge: "border-verdict-nogo/40 bg-verdict-nogo/10",
  },
};

export function scoreHex(score) {
  if (score >= 70) return "#16c784";
  if (score >= 45) return "#f5a623";
  return "#ef4d5f";
}

const levelText = { high: "text-verdict-nogo", medium: "text-verdict-pilot", low: "text-verdict-go" };
const levelDot = { high: "bg-verdict-nogo", medium: "bg-verdict-pilot", low: "bg-verdict-go" };

export function LevelChip({ level }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider ${
        levelText[level] || levelText.medium
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${levelDot[level] || levelDot.medium}`} />
      {level}
    </span>
  );
}

export function StatusChip({ status }) {
  const { t } = useLang();
  const base = "inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider";
  if (status === "done") {
    return (
      <span className={base}>
        <Check className="h-3.5 w-3.5" />
        {t("analyze.done")}
      </span>
    );
  }
  if (status === "working") {
    return (
      <span className={`${base} text-muted-foreground`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {t("analyze.working")}
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className={`${base} text-verdict-nogo`}>
        <X className="h-3.5 w-3.5" />
        {t("analyze.failed")}
      </span>
    );
  }
  return (
    <span className={`${base} text-muted-foreground/60`}>
      <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
      {t("analyze.queued")}
    </span>
  );
}
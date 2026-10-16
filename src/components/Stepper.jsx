import { Check } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const JOURNEY = [
  { labelKey: "stepper.step1", descKey: "journey.d1" },
  { labelKey: "stepper.step2", descKey: "journey.d2" },
  { labelKey: "stepper.step3", descKey: "journey.d3" },
  { labelKey: "stepper.step4", descKey: "journey.d4" },
  { labelKey: "stepper.step5", descKey: "journey.d5" },
  { labelKey: "stepper.step6", descKey: "journey.d6" },
];

export default function Stepper({ current, onSelect, className = "" }) {
  const { t } = useLang();
  return (
    <div className={className}>
      <ol className="flex items-center gap-2 sm:gap-3">
        {JOURNEY.map((s, i) => {
          const n = i + 1;
          const done = n < current;
          const isCurrent = n === current;
          const reachable = Boolean(onSelect) && done;
          return (
            <li key={s.labelKey} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect(n)}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex min-w-0 items-center gap-2 ${
                  reachable ? "transition-opacity hover:opacity-70" : "cursor-default"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs ${
                    isCurrent
                      ? "border-foreground bg-foreground text-background"
                      : done
                        ? "border-border text-foreground"
                        : "border-border text-muted-foreground/40"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : String(n).padStart(2, "0")}
                </span>
                <span
                  className={`hidden truncate text-xs sm:block ${
                    isCurrent ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/40"
                  }`}
                >
                  {t(s.labelKey)}
                </span>
              </button>
              {i < JOURNEY.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
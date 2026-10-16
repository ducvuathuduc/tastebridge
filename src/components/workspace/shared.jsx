import { useLang } from "@/lib/i18n";

export const PHASES = ["discover", "validate", "setup", "launch", "scale"];
export const DEAL_STAGES = ["intro", "termsheet", "signed", "lost"];
export const SITE_STATUSES = ["shortlist", "visit", "negotiating", "signed", "rejected"];
export const DOC_KINDS = ["erc", "food_safety", "import_permit", "lease", "trademark", "other"];

export function Section({ title, hint, action, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-border p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{title}</p>}
            {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={title || action ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function Empty({ children }) {
  const { t } = useLang();
  return <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{children || t("os.none")}</p>;
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40 ${props.className || ""}`}
    />
  );
}

export function Select({ options, ...props }) {
  return (
    <select
      {...props}
      className={`h-9 w-full rounded-md border border-border bg-background px-2 text-sm outline-none focus:border-foreground/40 ${props.className || ""}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Chip({ tone = "neutral", children, onClick, title }) {
  const tones = {
    neutral: "border-border text-muted-foreground",
    go: "border-verdict-go/40 bg-verdict-go/10 text-verdict-go",
    pilot: "border-verdict-pilot/40 bg-verdict-pilot/10 text-verdict-pilot",
    nogo: "border-verdict-nogo/40 bg-verdict-nogo/10 text-verdict-nogo",
    solid: "border-foreground bg-foreground text-background",
  };
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tones[tone]} ${onClick ? "transition-opacity hover:opacity-80" : ""}`}
    >
      {children}
    </Tag>
  );
}

export function DemoTag() {
  const { t } = useLang();
  return <Chip tone="pilot">{t("os.demoData")}</Chip>;
}

export const verdictTone = (v) => (v === "GO" ? "go" : v === "NO-GO" ? "nogo" : v === "PILOT" ? "pilot" : "neutral");

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr.slice(0, 10)}T00:00:00Z`).getTime();
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`).getTime();
  return Math.round((d - today) / 86400000);
}

export function expiryState(doc) {
  const n = daysUntil(doc.expires_at);
  if (n === null) return { tone: "neutral", key: "cp.noExpiry", n };
  if (n < 0) return { tone: "nogo", key: "cp.expired", n };
  if (n <= 30) return { tone: "pilot", key: "cp.expiresIn", n };
  return { tone: "go", key: "cp.ok", n };
}

export const fmtVnd = (n) => (n == null ? "—" : `${Number(n).toLocaleString("vi-VN")} ₫`);
export const fmtDate = (s, lang) => (s ? new Date(s).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB") : "—");
export const fmtDateTime = (s, lang) => (s ? new Date(s).toLocaleString(lang === "vi" ? "vi-VN" : "en-GB") : "—");

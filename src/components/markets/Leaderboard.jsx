import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import DemoBadge from "@/components/DemoBadge";
import { leaderboardRows } from "@/lib/marketsData";

const verdictCls = (v) =>
  v === "GO" ? "text-verdict-go" : v === "PILOT" ? "text-verdict-pilot" : "text-verdict-nogo";

export default function Leaderboard() {
  const { t, lang } = useLang();
  const cols = [
    "lb.col.rank",
    "vault.col.brand",
    "vault.col.market",
    "result.opportunity",
    "result.verdict",
    "lb.col.date",
  ];
  return (
    <FadeUp>
      <div className="flex items-center gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("lb.label")}
        </p>
        <DemoBadge labelKey="vault.sample" />
      </div>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-semibold tracking-tight">{t("lb.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("lb.sub")}</p>
      </div>
      <div className="mt-8 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[680px] text-left text-xs">
          <thead>
            <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
              {cols.map((c) => (
                <th key={c} className="px-4 py-3 font-normal">
                  {t(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leaderboardRows.map((r, i) => (
              <tr key={`${r.brand}-${r.city.en}-${r.date.en}`} className="text-muted-foreground">
                <td className="px-4 py-3 font-mono text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-4 py-3 text-foreground">{r.brand}</td>
                <td className="px-4 py-3">{r.city[lang]}</td>
                <td className="px-4 py-3 font-mono text-foreground">{r.index}</td>
                <td className={`px-4 py-3 font-mono ${verdictCls(r.verdict)}`}>{r.verdict}</td>
                <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider">
                  {r.date[lang]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeUp>
  );
}
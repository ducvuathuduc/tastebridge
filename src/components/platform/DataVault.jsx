import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import { vaultRows } from "@/lib/platformData";

export default function DataVault() {
  const { t, lang } = useLang();
  const cols = ["vault.col.brand", "vault.col.market", "vault.col.prediction", "vault.col.actual", "vault.col.signal"];
  return (
    <FadeUp>
      <div className="flex items-center gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("vault.label")}
        </p>
        <span className="rounded-md border border-verdict-pilot/40 bg-verdict-pilot/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-verdict-pilot">
          {t("vault.sample")}
        </span>
      </div>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-semibold tracking-tight">{t("vault.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("vault.sub")}</p>
      </div>
      <div className="mt-8 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-xs">
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
            {vaultRows.map((r) => (
              <tr key={r.brand} className="text-muted-foreground">
                <td className="px-4 py-3 text-foreground">{r.brand}</td>
                <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider">{r.market}</td>
                <td className="px-4 py-3 font-mono">{r.prediction}</td>
                <td className="px-4 py-3">{r.actual[lang]}</td>
                <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider">
                  {r.signal[lang]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeUp>
  );
}
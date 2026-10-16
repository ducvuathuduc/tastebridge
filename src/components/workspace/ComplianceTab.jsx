import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Chip, DOC_KINDS, Empty, Input, Section, Select, expiryState, fmtDate } from "./shared";

export default function ComplianceTab({ project, act }) {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ kind: "food_safety", title: "", issuer: "", expires_at: "" });
  const docs = [...(project.documents || [])].sort((a, b) => (expiryState(a).n ?? 1e9) - (expiryState(b).n ?? 1e9));
  const warnings = docs.filter((d) => ["nogo", "pilot"].includes(expiryState(d).tone));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await act((api) => api.createItem(project.id, "documents", { ...form, expires_at: form.expires_at || null, status: "active" }));
    setForm({ kind: "food_safety", title: "", issuer: "", expires_at: "" });
  };

  return (
    <div className="space-y-6">
      {warnings.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-verdict-pilot/40 bg-verdict-pilot/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-verdict-pilot" />
          <ul className="space-y-1">
            {warnings.map((d) => {
              const s = expiryState(d);
              return (
                <li key={d.id}>
                  <span className="font-medium">{d.title}</span> — {t(s.key, { n: s.n })}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <Section title={t("cp.title")} hint={t("cp.hint")}>
        {docs.length === 0 ? (
          <Empty />
        ) : (
          <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-normal">{t("cp.docTitle")}</th>
                  <th className="py-2 pr-3 font-normal">{t("cp.kind")}</th>
                  <th className="py-2 pr-3 font-normal">{t("cp.issuer")}</th>
                  <th className="py-2 pr-3 font-normal">{t("cp.expires")}</th>
                  <th className="py-2 pr-3 font-normal">{t("cp.status")}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const s = expiryState(d);
                  return (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-3">{d.title}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{t(`kind.${d.kind}`)}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{d.issuer || "—"}</td>
                      <td className="py-3 pr-3 font-mono text-xs">{fmtDate(d.expires_at, lang)}</td>
                      <td className="py-3 pr-3">
                        <Chip tone={s.tone}>{t(s.key, { n: s.n })}</Chip>
                      </td>
                      <td className="py-3 text-right">
                        <button type="button" aria-label={t("os.delete")} className="p-1 text-muted-foreground hover:text-verdict-nogo" onClick={() => act((api) => api.deleteItem(project.id, "documents", d.id))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <form onSubmit={submit} className="mt-5 grid gap-2 sm:grid-cols-[160px_1fr_1fr_150px_auto]">
          <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} options={DOC_KINDS.map((k) => ({ value: k, label: t(`kind.${k}`) }))} />
          <Input placeholder={t("cp.docTitle")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder={t("cp.issuer")} value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
          <Input type="date" aria-label={t("cp.expires")} value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          <button type="submit" className="btn-primary">
            {t("os.add")}
          </button>
        </form>
      </Section>
    </div>
  );
}

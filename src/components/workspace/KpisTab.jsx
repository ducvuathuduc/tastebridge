import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLang } from "@/lib/i18n";
import { DemoTag, Empty, Input, Section, Select } from "./shared";

const METRICS = ["orders", "revenue_vnd", "stores"];
const axis = { stroke: "hsl(0 0% 40%)", fontSize: 11, fontFamily: "Geist Mono, monospace" };
const tooltipStyle = { background: "hsl(0 0% 4%)", border: "1px solid hsl(0 0% 13%)", borderRadius: 6, fontSize: 12 };
const compact = (n) => (Math.abs(n) >= 1e6 ? `${(n / 1e6).toFixed(n % 1e6 ? 1 : 0)}M` : Math.abs(n) >= 1e3 ? `${(n / 1e3).toFixed(0)}k` : String(n));

export default function KpisTab({ project, act }) {
  const { t } = useLang();
  const month = new Date().toISOString().slice(0, 7);
  const [form, setForm] = useState({ month, metric: "orders", value: "", target: "" });
  const kpis = project.kpis || [];

  const series = useMemo(() => {
    const out = {};
    for (const metric of METRICS) {
      const rows = kpis.filter((k) => k.metric === metric).sort((a, b) => a.month.localeCompare(b.month));
      if (rows.length) out[metric] = rows.map((r) => ({ month: r.month, value: r.value, target: r.target }));
    }
    return out;
  }, [kpis]);

  const budget = useMemo(() => {
    const by = {};
    for (const b of project.budgets || []) {
      by[b.month] = by[b.month] || { month: b.month, planned: 0, actual: 0 };
      by[b.month].planned += b.planned_vnd;
      by[b.month].actual += b.actual_vnd;
    }
    return Object.values(by).sort((a, b) => a.month.localeCompare(b.month));
  }, [project.budgets]);

  const submit = async (e) => {
    e.preventDefault();
    if (form.value === "") return;
    await act((api) => api.createItem(project.id, "kpis", { month: form.month, metric: form.metric, value: Number(form.value), target: form.target === "" ? null : Number(form.target) }));
    setForm({ ...form, value: "", target: "" });
  };

  return (
    <div className="space-y-6">
      <Section title={t("kp.title")} action={project.is_demo ? <DemoTag /> : null}>
        {Object.keys(series).length === 0 ? (
          <Empty>{t("kp.empty")}</Empty>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {Object.entries(series).map(([metric, data]) => (
              <div key={metric}>
                <p className="text-sm">{t(`metric.${metric}`)}</p>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
                      <CartesianGrid stroke="hsl(0 0% 13%)" vertical={false} />
                      <XAxis dataKey="month" tick={axis} tickLine={false} axisLine={false} />
                      <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={compact} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => Number(v).toLocaleString()} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="value" name={t("kp.actual")} stroke="hsl(152 84% 44%)" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="target" name={t("kp.target")} stroke="hsl(0 0% 60%)" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={submit} className="mt-6 grid gap-2 sm:grid-cols-[180px_170px_1fr_1fr_auto]">
          <Input type="month" aria-label={t("kp.month")} value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
          <Select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} options={METRICS.map((m) => ({ value: m, label: t(`metric.${m}`) }))} />
          <Input type="number" placeholder={t("kp.value")} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <Input type="number" placeholder={t("kp.target")} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
          <button type="submit" className="btn-primary">
            {t("os.add")}
          </button>
        </form>
      </Section>

      {budget.length > 0 && (
        <Section title={t("kp.budget")} action={project.is_demo ? <DemoTag /> : null}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budget} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid stroke="hsl(0 0% 13%)" vertical={false} />
                <XAxis dataKey="month" tick={axis} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={compact} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(0 0% 9%)" }} formatter={(v) => `${Number(v).toLocaleString("vi-VN")} ₫`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="planned" name={t("kp.planned")} fill="hsl(0 0% 30%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="actual" name={t("kp.actual")} fill="hsl(38 92% 50%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/api/client";
import { cities, categories } from "@/lib/analyzeData";
import FadeUp from "@/components/FadeUp";
import { Chip, DemoTag, Empty, Input, PHASES, Section, Select, verdictTone } from "@/components/workspace/shared";
import OverviewTab from "@/components/workspace/OverviewTab";
import RoadmapTab from "@/components/workspace/RoadmapTab";
import ComplianceTab from "@/components/workspace/ComplianceTab";
import PartnersTab from "@/components/workspace/PartnersTab";
import SitesTab from "@/components/workspace/SitesTab";
import KpisTab from "@/components/workspace/KpisTab";
import ActivityTab from "@/components/workspace/ActivityTab";
import CopilotPanel from "@/components/workspace/CopilotPanel";

const TABS = ["overview", "roadmap", "compliance", "partners", "sites", "kpis", "activity"];

function ErrorBox({ message, onRetry }) {
  const { t } = useLang();
  return (
    <div className="rounded-lg border border-verdict-nogo/40 bg-verdict-nogo/10 p-6 text-sm">
      <p className="font-medium">{t("os.error")}</p>
      <p className="mt-1 text-muted-foreground">{message || t("os.apiDown")}</p>
      {onRetry && (
        <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
          {t("os.retry")}
        </button>
      )}
    </div>
  );
}

function ProjectList() {
  const { t, lang } = useLang();
  const { user, resetWorkspace, ownerId } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    brand: params.get("brand") || "",
    city: params.get("city") || "hcmc",
    category: params.get("category") || "coffee_tea",
  });

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.listProjects(true);
      setProjects(r.projects || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load, ownerId]);

  const create = async (e) => {
    e.preventDefault();
    if (!form.brand.trim()) return;
    setBusy(true);
    try {
      const p = await api.createProject(form);
      navigate(`/workspace/${p.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const loadDemo = async () => {
    setBusy(true);
    try {
      const p = await api.seedDemo();
      navigate(`/workspace/${p.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cityName = (id) => cities.find((c) => c.id === id)?.name[lang] || id;
  const catName = (id) => categories.find((c) => c.id === id)?.name[lang] || id;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("ws.label")}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t("ws.title")}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("ws.sub")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span>
            {user.email} · {t("ws.localAccount")}
          </span>
          <button type="button" className="underline-offset-4 hover:text-foreground hover:underline" onClick={resetWorkspace}>
            {t("ws.resetWorkspace")}
          </button>
        </div>
      </FadeUp>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          {error && <ErrorBox message={error} onRetry={load} />}
          {!projects && !error && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("os.loading")}
            </p>
          )}
          {projects && projects.length === 0 && <Empty>{t("ws.empty")}</Empty>}
          {projects && projects.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((p) => (
                <Link key={p.id} to={`/workspace/${p.id}`} className="group rounded-lg border border-border p-5 transition-colors hover:border-foreground/30">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{p.brand}</p>
                    {p.is_demo ? <DemoTag /> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cityName(p.city)} · {catName(p.category)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Chip>
                      {t("ws.stage")}: {t(`phase.${p.stage}`)}
                    </Chip>
                    {p.latest_verdict ? (
                      <Chip tone={verdictTone(p.latest_verdict)}>
                        {p.latest_verdict} · {p.latest_index}
                      </Chip>
                    ) : (
                      <Chip>{t("ws.noVerdict")}</Chip>
                    )}
                  </div>
                  <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                    {t("ws.open")} <ArrowRight className="h-3 w-3" />
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Section title={t("ws.newProject")}>
          <form onSubmit={create} className="space-y-3">
            <Input placeholder={t("ws.brand")} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} maxLength={80} />
            <Select aria-label={t("ws.city")} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} options={cities.map((c) => ({ value: c.id, label: c.name[lang] }))} />
            <Select aria-label={t("ws.category")} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={categories.map((c) => ({ value: c.id, label: c.name[lang] }))} />
            <button type="submit" className="btn-primary w-full" disabled={busy || !form.brand.trim()}>
              <Plus className="h-3.5 w-3.5" /> {t("ws.create")}
            </button>
          </form>
          <button type="button" className="btn-secondary mt-3 w-full" onClick={loadDemo} disabled={busy}>
            {t("ws.loadDemo")}
          </button>
        </Section>
      </div>
    </div>
  );
}

function ProjectDetail({ projectId }) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [copilot, setCopilot] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setProject(await api.getProject(projectId));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [projectId]);
  useEffect(() => {
    setProject(null);
    refresh();
  }, [refresh]);

  const act = useCallback(
    async (fn) => {
      try {
        await fn(api);
      } catch (err) {
        setError(err.message);
      }
      await refresh();
    },
    [refresh]
  );

  if (error && !project)
    return (
      <div className="mx-auto max-w-6xl px-6 py-14">
        <ErrorBox message={error} onRetry={refresh} />
      </div>
    );
  if (!project)
    return (
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-14 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {t("os.loading")}
      </div>
    );

  const city = cities.find((c) => c.id === project.city);
  const category = categories.find((c) => c.id === project.category);
  const props = { project, refresh, act, onTab: setTab };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/workspace" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> {t("ws.back")}
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.brand}</h1>
            {project.is_demo && <DemoTag />}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {city?.name[lang]} · {category?.name[lang]}
          </p>
          {project.description && <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{project.description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label={t("ws.stage")}
            className="w-40"
            value={project.stage}
            onChange={(e) => act((a) => a.updateProject(project.id, { stage: e.target.value }))}
            options={PHASES.map((p) => ({ value: p, label: `${t("ws.stage")}: ${t(`phase.${p}`)}` }))}
          />
          <button type="button" className="btn-primary" onClick={() => setCopilot(true)}>
            <Sparkles className="h-3.5 w-3.5" /> {t("co.open")}
          </button>
          <button
            type="button"
            aria-label={t("os.delete")}
            className="btn-secondary px-3"
            onClick={async () => {
              if (!window.confirm(t("ws.deleteConfirm"))) return;
              try {
                await api.deleteProject(project.id);
                navigate("/workspace");
              } catch (err) {
                setError(err.message);
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-md border border-verdict-nogo/40 bg-verdict-nogo/10 px-3 py-2 text-xs">{error}</p>}

      <div className="mt-8 -mx-6 overflow-x-auto border-b border-border px-6">
        <div className="flex min-w-max gap-1">
          {TABS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors ${tab === k ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t(`ws.tab.${k}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {tab === "overview" && <OverviewTab {...props} />}
        {tab === "roadmap" && <RoadmapTab {...props} />}
        {tab === "compliance" && <ComplianceTab {...props} />}
        {tab === "partners" && <PartnersTab {...props} />}
        {tab === "sites" && <SitesTab {...props} />}
        {tab === "kpis" && <KpisTab {...props} />}
        {tab === "activity" && <ActivityTab {...props} />}
      </div>

      <CopilotPanel project={project} open={copilot} onClose={() => setCopilot(false)} />
    </div>
  );
}

export default function Workspace() {
  const { projectId } = useParams();
  return projectId ? <ProjectDetail projectId={projectId} /> : <ProjectList />;
}

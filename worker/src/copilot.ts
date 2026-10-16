import type { Env } from './env';
import { HttpError } from './env';
import { CATEGORIES, CITY_NAMES } from './catalog';
import { chat } from './llm';

/** Entry Copilot: answers questions with the project's live context (stage, roadmap, docs, deals, latest verdict). */
export async function runCopilot(env: Env, project: any, body: any) {
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 2000) : '';
  if (!message) throw new HttpError(400, 'message is required');
  const lang = body?.lang === 'vi' ? 'vi' : 'en';
  const history = (Array.isArray(body?.history) ? body.history : [])
    .filter((h: any) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
    .slice(-8)
    .map((h: any) => ({ role: h.role, content: h.content.slice(0, 2000) }));

  const v = project.latestVerdict?.result;
  const today = new Date().toISOString().slice(0, 10);
  const ctx = [
    `Brand: ${project.brand}${project.is_demo ? ' (DEMO project with fictional data)' : ''}`,
    `City: ${CITY_NAMES[project.city]} · Category: ${CATEGORIES[project.category]?.label} · Current stage: ${project.stage}`,
    v ? `Latest verdict: ${v.verdict}, Opportunity Index ${v.opportunityIndex}, confidence ${v.confidence}. Headline: ${v.headline}` : 'No analysis has been run yet.',
    v?.risks?.length ? `Top risks: ${v.risks.map((r: any) => `${r.risk} (${r.severity})`).join('; ')}` : '',
    `Roadmap: ${(project.milestones || []).map((m: any) => `[${m.status}] ${m.phase}: ${m.title}${m.due_date ? ` (due ${m.due_date})` : ''}`).join(' | ')}`,
    `Documents: ${(project.documents || []).map((d: any) => `${d.title} — ${d.status}${d.expires_at ? `, expires ${d.expires_at}` : ''}`).join(' | ') || 'none'}`,
    `Partner deals: ${(project.deals || []).map((d: any) => `${d.partner_name} (${d.stage})`).join(', ') || 'none'}`,
    `Sites: ${(project.sites || []).map((s: any) => `${s.district}${s.score != null ? ` score ${s.score}` : ''} (${s.status})`).join(', ') || 'none'}`
  ].filter(Boolean).join('\n');

  const system = `You are Entry Copilot inside TasteBridge, a market-entry operating system for foreign brands entering Vietnam. Today is ${today}.
Use the project context below. Be concrete and brief (max ~180 words), use bullet points for steps, and point to the roadmap step or department that owns each action.
Never invent statistics or legal certainty; for legal/tax matters advise confirming with a licensed Vietnamese advisor.
${lang === 'vi' ? 'Answer in Vietnamese.' : 'Answer in English.'}

PROJECT CONTEXT
${ctx}`;

  const r = await chat(env, { system, prompt: message, history, temperature: 0.5, maxTokens: 700 });
  return { ok: true, reply: r.text.trim(), meta: { provider: r.provider, model: r.model } };
}

import type { Env } from './env';
import { HttpError } from './env';

export type Provider = 'groq' | 'gemini' | 'openai';

export function pickProvider(env: Env): { provider: Provider; model: string; key: string } {
  const order: Provider[] = [];
  const pref = (env.LLM_PROVIDER || '').toLowerCase() as Provider;
  if (pref) order.push(pref);
  order.push('groq', 'gemini', 'openai');
  for (const p of order) {
    if (p === 'groq' && env.GROQ_API_KEY) return { provider: p, model: env.GROQ_MODEL || 'llama-3.3-70b-versatile', key: env.GROQ_API_KEY };
    if (p === 'gemini' && env.GEMINI_API_KEY) return { provider: p, model: env.GEMINI_MODEL || 'gemini-2.0-flash', key: env.GEMINI_API_KEY };
    if (p === 'openai' && env.OPENAI_API_KEY) return { provider: p, model: env.OPENAI_MODEL || 'gpt-4o-mini', key: env.OPENAI_API_KEY };
  }
  throw new HttpError(503, 'No LLM key is configured on the server (GROQ_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY).', 'llm_unconfigured');
}

interface ChatOpts {
  system?: string;
  prompt: string;
  json?: boolean;
  schema?: unknown;
  temperature?: number;
  maxTokens?: number;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface LlmResult {
  text: string;
  provider: Provider;
  model: string;
}

async function openAiCompatible(url: string, key: string, model: string, o: ChatOpts): Promise<string> {
  const messages: any[] = [];
  if (o.system) messages.push({ role: 'system', content: o.system });
  for (const h of o.history || []) messages.push(h);
  messages.push({ role: 'user', content: o.prompt });
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      temperature: o.temperature ?? 0.4,
      max_tokens: o.maxTokens ?? 4096,
      ...(o.json ? { response_format: { type: 'json_object' } } : {})
    }),
    signal: AbortSignal.timeout(60000)
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new HttpError(502, `LLM provider error ${res.status}: ${body.slice(0, 200)}`, 'llm_error');
  }
  const data: any = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function gemini(key: string, model: string, o: ChatOpts): Promise<string> {
  const contents: any[] = [];
  for (const h of o.history || []) contents.push({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] });
  contents.push({ role: 'user', parts: [{ text: o.prompt }] });
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      ...(o.system ? { systemInstruction: { parts: [{ text: o.system }] } } : {}),
      contents,
      generationConfig: {
        temperature: o.temperature ?? 0.4,
        maxOutputTokens: o.maxTokens ?? 4096,
        ...(o.json ? { responseMimeType: 'application/json' } : {})
      }
    }),
    signal: AbortSignal.timeout(60000)
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new HttpError(502, `LLM provider error ${res.status}: ${body.slice(0, 200)}`, 'llm_error');
  }
  const data: any = await res.json();
  return (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('');
}

export async function chat(env: Env, o: ChatOpts): Promise<LlmResult> {
  const { provider, model, key } = pickProvider(env);
  let prompt = o.prompt;
  if (o.json && o.schema) {
    prompt += `\n\nReturn ONLY one JSON object (no markdown fences) that conforms to this JSON Schema:\n${JSON.stringify(o.schema)}`;
  }
  const opts = { ...o, prompt };
  let text: string;
  if (provider === 'groq') text = await openAiCompatible('https://api.groq.com/openai/v1/chat/completions', key, model, opts);
  else if (provider === 'openai') text = await openAiCompatible('https://api.openai.com/v1/chat/completions', key, model, opts);
  else text = await gemini(key, model, opts);
  return { text, provider, model };
}

export function parseJson(text: string): any {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function chatJson(env: Env, o: ChatOpts): Promise<{ data: any } & LlmResult> {
  const r = await chat(env, { ...o, json: true });
  return { ...r, data: parseJson(r.text) };
}

import type { Env } from './env';
import { HttpError } from './env';
import { CATEGORIES, CITY_NAMES, normalizeCategory, normalizeCity } from './catalog';
import { gatherEvidence } from './qloo';
import { chatJson } from './llm';

const sev = { type: 'string', enum: ['low', 'medium', 'high'] };

export const LOCALIZE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    readiness: { type: 'integer', description: '0-100: how ready the plan is for Vietnamese consumers as written' },
    pricing: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          planPrice: { type: 'string', description: 'price as written in the plan, or "not stated"' },
          suggestedVnd: { type: 'string', description: 'suggested VND price or range, e.g. "65,000–75,000 VND"' },
          rationale: { type: 'string' }
        },
        required: ['item', 'planPrice', 'suggestedVnd', 'rationale']
      }
    },
    productChanges: {
      type: 'array',
      items: { type: 'object', properties: { area: { type: 'string' }, current: { type: 'string' }, change: { type: 'string' }, why: { type: 'string' } }, required: ['area', 'current', 'change', 'why'] }
    },
    channels: {
      type: 'array',
      items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, action: { type: 'string' } }, required: ['name', 'role', 'action'] }
    },
    regulations: {
      type: 'array',
      items: { type: 'object', properties: { item: { type: 'string' }, authority: { type: 'string' }, action: { type: 'string' }, phase: { type: 'string', enum: ['discover', 'validate', 'setup', 'launch', 'scale'] } }, required: ['item', 'authority', 'action', 'phase'] }
    },
    culturalRisks: {
      type: 'array',
      items: { type: 'object', properties: { risk: { type: 'string' }, severity: sev, mitigation: { type: 'string' } }, required: ['risk', 'severity', 'mitigation'] }
    },
    nextSteps: { type: 'array', items: { type: 'string' } }
  },
  required: ['summary', 'readiness', 'pricing', 'productChanges', 'channels', 'regulations', 'culturalRisks', 'nextSteps']
};

export interface LocalizeInput {
  planText: string;
  city: string;
  category: string;
  brandName: string;
  lang: 'en' | 'vi';
}

export function parseLocalizeInput(body: any): LocalizeInput {
  const rawPlan = body?.plan_text ?? body?.planText;
  const planText = typeof rawPlan === 'string' ? rawPlan.trim() : '';
  const city = normalizeCity(body?.city);
  const category = normalizeCategory(body?.category);
  const rawBrand = body?.brand ?? body?.brandName;
  const brandName = typeof rawBrand === 'string' ? rawBrand.trim().slice(0, 80) : '';
  const lang = body?.lang === 'vi' ? 'vi' : 'en';
  if (planText.length < 80) throw new HttpError(400, 'Business plan text is too short (min 80 characters).');
  if (!city || !category) throw new HttpError(400, 'city and category are required (e.g. "hcmc", "coffee_tea").');
  return { planText: planText.slice(0, 24000), city, category, brandName, lang };
}

/** Extract text from an uploaded PDF or text file. */
export async function extractUploadText(file: File): Promise<string> {
  const name = (file.name || '').toLowerCase();
  if (file.size > 8 * 1024 * 1024) throw new HttpError(413, 'File too large (max 8 MB).');
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    const { extractText, getDocumentProxy } = await import('unpdf');
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join('\n') : String(text || '');
  }
  if ((file.type || '').startsWith('text/') || /\.(txt|md|markdown|csv)$/.test(name)) return await file.text();
  throw new HttpError(415, 'Unsupported file type. Upload a PDF, .txt or .md file, or paste the text.');
}

const str = (v: unknown, max: number) => String(v ?? '').slice(0, max);
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : []);
const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
const level = (v: unknown) => (['low', 'medium', 'high'].includes(v as string) ? (v as string) : 'medium');
const PHASES = ['discover', 'validate', 'setup', 'launch', 'scale'];

export async function runLocalize(env: Env, input: LocalizeInput) {
  const { planText, city, category, brandName, lang } = input;
  const cat = CATEGORIES[category];
  const evidence = await gatherEvidence(env, brandName, city, category);

  const evidenceLines = [
    evidence.brandFound ? `- Brand match on Qloo: "${evidence.matchedName}"` : `- No direct Qloo brand entity${brandName ? ` for "${brandName}"` : ''}; category-level signals used.`,
    `- Taste tags: ${evidence.brandTags.join(', ') || 'none available'}`,
    `- Related brands with measured Qloo affinity (0-1): ${evidence.relatedBrands.map((b) => `${b.name} ${b.affinity ?? 'n/a'}`).join(', ') || 'none available'}`,
    `- Popular ${cat.placeTerm}s in ${CITY_NAMES[city]} per Qloo: ${evidence.cityPlaces.join(', ') || 'none available'}`
  ].join('\n');

  const prompt = `You are TasteBridge's Plan Localizer — a team of agents (Pricing, Product, Channels, Legal & Compliance, Cultural Risk) that rewrites a foreign brand's business plan for Vietnamese consumers.

TARGET
- City: ${CITY_NAMES[city]}
- Category: ${cat.label}
${brandName ? `- Brand: ${brandName}` : ''}

QLOO TASTE AI EVIDENCE for ${CITY_NAMES[city]} — real measured data; cite it where relevant and never contradict it:
${evidenceLines}

BUSINESS PLAN (verbatim from the user, may be truncated):
"""
${planText}
"""

TASKS
1. Pricing agent: for the main products/price points in the plan, suggest VND prices for ${CITY_NAMES[city]} consumers. If the plan states no prices, say "not stated" and suggest a range anchored to local competitors you know. Label suggestions as estimates; do not invent survey data.
2. Product agent: concrete menu/product localisation changes (sizes, sweetness, ingredients, flavours, packaging, gifting formats, Tết/Mid-Autumn seasonal items).
3. Channels agent: which of GrabFood, ShopeeFood, TikTok Shop, Shopee, Zalo OA, Facebook, Instagram, own stores fit this plan and what to do on each.
4. Legal & Compliance agent: required steps in Vietnam (e.g. trademark filing at IP Vietnam, enterprise/investment registration, food safety certificate, import permits & labelling, lease registration, tax). Name the authority and assign a roadmap phase (discover/validate/setup/launch/scale). Describe requirements generally; tell the user to confirm with a licensed local advisor.
5. Cultural risk agent: 3-5 cultural or consumer risks in the plan with severity and mitigation.
6. Summary + readiness score (0-100) + 3-6 next steps.

RULES
- ${lang === 'vi' ? 'Write all human-readable text in Vietnamese.' : 'Write all human-readable text in English.'}
- Refer to specifics in the plan. No generic filler. Never fabricate statistics, market shares or survey results.`;

  const llm = await chatJson(env, { prompt, schema: LOCALIZE_SCHEMA, maxTokens: 6000 });
  const p = llm.data;
  if (!p || typeof p !== 'object' || typeof p.summary !== 'string') {
    throw new HttpError(502, 'Plan localisation agents did not return a usable result.', 'llm_invalid');
  }
  const result = {
    summary: str(p.summary, 1500),
    readiness: clamp(p.readiness),
    pricing: arr(p.pricing).slice(0, 10).map((x) => ({ item: str(x?.item, 120), planPrice: str(x?.planPrice, 80), suggestedVnd: str(x?.suggestedVnd, 80), rationale: str(x?.rationale, 300) })),
    productChanges: arr(p.productChanges).slice(0, 10).map((x) => ({ area: str(x?.area, 80), current: str(x?.current, 300), change: str(x?.change, 300), why: str(x?.why, 300) })),
    channels: arr(p.channels).slice(0, 8).map((x) => ({ name: str(x?.name, 60), role: str(x?.role, 120), action: str(x?.action, 300) })),
    regulations: arr(p.regulations).slice(0, 10).map((x) => ({ item: str(x?.item, 160), authority: str(x?.authority, 120), action: str(x?.action, 300), phase: PHASES.includes(x?.phase) ? x.phase : 'setup' })),
    culturalRisks: arr(p.culturalRisks).slice(0, 6).map((x) => ({ risk: str(x?.risk, 300), severity: level(x?.severity), mitigation: str(x?.mitigation, 300) })),
    nextSteps: arr(p.nextSteps).slice(0, 8).map((x) => str(x, 300))
  };
  return {
    ok: true as const,
    result,
    evidence: {
      brandFound: evidence.brandFound,
      matchedName: evidence.matchedName,
      brandTags: evidence.brandTags,
      relatedBrands: evidence.relatedBrands,
      cityPlaces: evidence.cityPlaces
    },
    inputs: { city, category, brandName, lang, planChars: planText.length },
    meta: { provider: llm.provider, model: llm.model, source: 'qloo-hackathon-api' }
  };
}

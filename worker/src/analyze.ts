import type { Env } from './env';
import { HttpError } from './env';
import { CATEGORIES, CITY_NAMES, NEIGHBORHOODS, normalizeCategory, normalizeCity } from './catalog';
import { gatherEvidence } from './qloo';
import { chatJson } from './llm';

export const AGENT_IDS = [
  'brandProfiler', 'audienceMapper', 'cityScout', 'tasteAffinity', 'competitorScan',
  'culturalFit', 'priceSensitivity', 'channelPlanner', 'riskAnalyst', 'localizationWriter', 'verdictSynthesizer'
];

const level3 = { type: 'string', enum: ['low', 'medium', 'high'] };

export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['GO', 'PILOT', 'NO-GO'] },
    confidence: { type: 'integer' },
    opportunityIndex: { type: 'integer' },
    headline: { type: 'string' },
    verdictRationale: { type: 'string' },
    memoIntro: { type: 'string' },
    agents: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string', enum: AGENT_IDS }, summary: { type: 'string' }, findings: { type: 'array', items: { type: 'string' } } },
        required: ['id', 'summary', 'findings']
      }
    },
    affinity: {
      type: 'object',
      properties: { overall: { type: 'integer' }, cultural: { type: 'integer' }, audience: { type: 'integer' }, competition: { type: 'integer' }, price: { type: 'integer' } },
      required: ['overall', 'cultural', 'audience', 'competition', 'price']
    },
    segments: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, appeal: { type: 'integer' }, why: { type: 'string' } }, required: ['name', 'appeal', 'why'] } },
    competitors: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, positioning: { type: 'string' }, threat: level3 }, required: ['name', 'positioning', 'threat'] } },
    risks: { type: 'array', items: { type: 'object', properties: { risk: { type: 'string' }, severity: level3, mitigation: { type: 'string' } }, required: ['risk', 'severity', 'mitigation'] } },
    channels: { type: 'array', items: { type: 'string' } },
    partners: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, fit: { type: 'integer' }, why: { type: 'string' } }, required: ['name', 'role', 'fit', 'why'] } },
    neighborhoods: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, score: { type: 'integer' }, note: { type: 'string' } }, required: ['name', 'score', 'note'] } }
  },
  required: ['verdict', 'confidence', 'opportunityIndex', 'headline', 'verdictRationale', 'memoIntro', 'agents', 'affinity', 'segments', 'competitors', 'risks', 'channels', 'partners', 'neighborhoods']
};

export interface AnalyzeInput {
  brandName: string;
  city: string;
  category: string;
  lang: 'en' | 'vi';
  hoodNames: string[];
}

export function parseAnalyzeInput(body: any): AnalyzeInput {
  const raw = body?.brandName ?? body?.brand;
  const brandName = typeof raw === 'string' ? raw.trim().slice(0, 80) : '';
  const city = normalizeCity(body?.city);
  const category = normalizeCategory(body?.category);
  const lang = body?.lang === 'vi' ? 'vi' : 'en';
  if (!brandName || !city || !category) throw new HttpError(400, 'Invalid analysis request: brandName, city and category are required');
  let hoodNames: string[] = Array.isArray(body?.neighborhoods)
    ? body.neighborhoods.filter((n: unknown) => typeof n === 'string' && n.length >= 1 && n.length <= 60).slice(0, 15)
    : [];
  if (hoodNames.length === 0) hoodNames = NEIGHBORHOODS[city].map((n) => n.name);
  return { brandName, city, category, lang, hoodNames };
}

const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
const str = (v: unknown, max: number) => String(v ?? '').slice(0, max);
const level = (v: unknown) => (['low', 'medium', 'high'].includes(v as string) ? (v as string) : 'medium');
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : []);

export async function runAnalysis(env: Env, input: AnalyzeInput) {
  const { brandName, city, category, lang, hoodNames } = input;
  const cat = CATEGORIES[category];
  const evidence = await gatherEvidence(env, brandName, city, category);

  const languageInstruction = lang === 'vi'
    ? 'Write every piece of human-readable text (summaries, findings, segment names, rationale, memo intro) in Vietnamese.'
    : 'Write every piece of human-readable text in English.';

  const evidenceLines = [
    `- Brand match: ${evidence.brandFound ? `"${evidence.matchedName}" (Qloo entity, popularity ${evidence.brandPopularity !== null ? evidence.brandPopularity.toFixed(2) : 'n/a'})` : `No Qloo brand entity found for "${brandName}" — category-level taste signals were used instead.`}`,
    `- Taste tags: ${evidence.brandTags.length > 0 ? evidence.brandTags.join(', ') : 'none available'}`,
    `- Related brands with measured Qloo affinity (0-1): ${evidence.relatedBrands.length > 0 ? evidence.relatedBrands.map((b) => `${b.name} ${b.affinity ?? 'n/a'}`).join(', ') : 'none available'}`,
    `- Popular ${cat.placeTerm}s in ${CITY_NAMES[city]} per Qloo: ${evidence.cityPlaces.length > 0 ? evidence.cityPlaces.join(', ') : 'none available'}`
  ].join('\n');

  const prompt = `You are TasteBridge — a rigorous market-entry analyst for consumer brands entering Vietnam. You run a pipeline of 11 specialist agents and produce one structured verdict.

BRIEF
- Brand: ${brandName}
- Category: ${cat.label}
- Target city: ${CITY_NAMES[city]}

QLOO TASTE AI EVIDENCE — real measured data. Ground your reasoning in it and never contradict it:
${evidenceLines}

AGENTS — produce an output for each, in this order:
01 brandProfiler: profile the brand's positioning, price tier and cultural signals as Vietnamese consumers would read them.
02 audienceMapper: identify the top Vietnamese consumer segments likely to engage, with a reason each.
03 cityScout: benchmark ${CITY_NAMES[city]} for this category — where demand and retail gravity sit.
04 tasteAffinity: interpret the Qloo evidence above into affinity scores (overall, cultural, audience, competition, price), each 0-100.
05 competitorScan: name real competitors in ${CITY_NAMES[city]} — use the related-brands evidence plus your market knowledge — with their positioning.
06 culturalFit: assess fit with local norms, gifting culture, family structure and social-media habits.
07 priceSensitivity: willingness to pay versus local income levels, and pricing headroom.
08 channelPlanner: recommend 3-4 concrete launch channels for ${CITY_NAMES[city]} (e.g. Shopee, Lazada, TikTok Shop, retail districts, partnerships).
09 riskAnalyst: 3-5 concrete risks, each with severity and a mitigation.
10 localizationWriter: draft a one-sentence positioning line that would land with Vietnamese consumers; put it in the summary.
11 verdictSynthesizer: weigh every agent's output into the final verdict, headline and rationale.

VERDICT RULES
- GO: strong measured affinity, clear demand, manageable competition and risk.
- PILOT: promising signals but meaningful uncertainty — a limited pilot should come first.
- NO-GO: weak affinity or a fundamental category, cultural or price mismatch.
- Confidence (0-100) must reflect evidence quality; when the brand had no direct Qloo entity, keep it below 70.

OPPORTUNITY INDEX
- One number (0-100) for the overall market opportunity in ${CITY_NAMES[city]}. It must be consistent with the verdict and affinity scores (GO typically 70+, PILOT 40-75, NO-GO below 45).

PARTNERS
- Recommend 3-4 concrete launch partners for ${CITY_NAMES[city]}: distributors, retail chains, e-commerce platforms, delivery apps, mall operators or co-branding partners. Name real companies where credible, otherwise name the partner type. Each has: name, role, fit (0-100) and a one-line why. Human-readable partner text follows the language rule below.

NEIGHBORHOODS — score each of these districts in ${CITY_NAMES[city]} as a first-store opportunity for this brand (0-100) with a one-line note. Use exactly these names:
${hoodNames.join(', ')}

OUTPUT RULES
- ${languageInstruction}
- Each agent: summary is one sentence (max ~220 characters); findings are two short bullets (max ~140 characters each).
- Be specific to ${CITY_NAMES[city]} and the ${cat.label} category. No generic filler.
- Never fabricate statistics, market-share numbers or ratings.`;

  const llm = await chatJson(env, { prompt, schema: RESPONSE_SCHEMA, maxTokens: 6000 });
  let parsed = llm.data;
  if (parsed && typeof parsed === 'object' && !parsed.verdict && parsed.response) parsed = parsed.response;
  if (!parsed || !['GO', 'PILOT', 'NO-GO'].includes(parsed.verdict)) {
    throw new HttpError(502, 'Agent reasoning failed to produce a verdict.', 'llm_invalid');
  }

  const result = {
    verdict: parsed.verdict as 'GO' | 'PILOT' | 'NO-GO',
    confidence: clamp(parsed.confidence),
    opportunityIndex: clamp(parsed.opportunityIndex),
    headline: str(parsed.headline, 300),
    verdictRationale: str(parsed.verdictRationale, 1200),
    memoIntro: str(parsed.memoIntro, 1500),
    agents: arr(parsed.agents)
      .filter((a) => a && AGENT_IDS.includes(a.id))
      .map((a) => ({ id: a.id, summary: str(a.summary, 400), findings: arr(a.findings).slice(0, 3).map((f) => str(f, 300)) })),
    affinity: {
      overall: clamp(parsed.affinity?.overall),
      cultural: clamp(parsed.affinity?.cultural),
      audience: clamp(parsed.affinity?.audience),
      competition: clamp(parsed.affinity?.competition),
      price: clamp(parsed.affinity?.price)
    },
    segments: arr(parsed.segments).slice(0, 5).map((s) => ({ name: str(s?.name, 80), appeal: clamp(s?.appeal), why: str(s?.why, 300) })),
    competitors: arr(parsed.competitors).slice(0, 6).map((c) => ({ name: str(c?.name, 80), positioning: str(c?.positioning, 300), threat: level(c?.threat) })),
    risks: arr(parsed.risks).slice(0, 5).map((r) => ({ risk: str(r?.risk, 300), severity: level(r?.severity), mitigation: str(r?.mitigation, 300) })),
    channels: arr(parsed.channels).slice(0, 4).map((c) => str(c, 200)),
    partners: arr(parsed.partners).slice(0, 4).map((p) => ({ name: str(p?.name, 80), role: str(p?.role, 120), fit: clamp(p?.fit), why: str(p?.why, 300) })),
    neighborhoods: arr(parsed.neighborhoods)
      .filter((n) => n && hoodNames.includes(n.name))
      .map((n) => ({ name: String(n.name), score: clamp(n.score), note: str(n.note, 200) }))
  };

  if (result.agents.length === 0) throw new HttpError(502, 'Agent reasoning returned no agent outputs.', 'llm_invalid');

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
    inputs: { brandName, city, category: cat.label, categoryId: category, lang },
    meta: { provider: llm.provider, model: llm.model, source: 'qloo-hackathon-api' }
  };
}

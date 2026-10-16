import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const QLOO_BASE = 'https://hackathon.api.qloo.com';

const CITY_COORDS = { hcmc: '10.776,106.703', hanoi: '21.028,105.852', danang: '16.047,108.218' };
const CITY_NAMES = { hcmc: 'Ho Chi Minh City', hanoi: 'Hanoi', danang: 'Da Nang' };

const CATEGORIES = {
  food_beverage: { label: 'Food & Beverage', brandTerm: 'restaurant chain', placeTerm: 'restaurant' },
  coffee_tea: { label: 'Coffee & Tea', brandTerm: 'specialty coffee', placeTerm: 'specialty coffee' },
  fashion: { label: 'Fashion & Apparel', brandTerm: 'fashion apparel brand', placeTerm: 'fashion boutique' },
  beauty: { label: 'Beauty & Personal Care', brandTerm: 'skincare brand', placeTerm: 'beauty salon' },
  electronics: { label: 'Consumer Electronics', brandTerm: 'consumer electronics brand', placeTerm: 'electronics store' },
  wellness: { label: 'Health & Wellness', brandTerm: 'fitness brand', placeTerm: 'gym' },
  home_living: { label: 'Home & Living', brandTerm: 'home furnishing brand', placeTerm: 'furniture store' }
};

const AGENT_IDS = [
  'brandProfiler', 'audienceMapper', 'cityScout', 'tasteAffinity', 'competitorScan',
  'culturalFit', 'priceSensitivity', 'channelPlanner', 'riskAnalyst', 'localizationWriter', 'verdictSynthesizer'
];

const RESPONSE_SCHEMA = {
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
        properties: {
          id: { type: 'string', enum: AGENT_IDS },
          summary: { type: 'string' },
          findings: { type: 'array', items: { type: 'string' } }
        },
        required: ['id', 'summary', 'findings']
      }
    },
    affinity: {
      type: 'object',
      properties: {
        overall: { type: 'integer' },
        cultural: { type: 'integer' },
        audience: { type: 'integer' },
        competition: { type: 'integer' },
        price: { type: 'integer' }
      },
      required: ['overall', 'cultural', 'audience', 'competition', 'price']
    },
    segments: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, appeal: { type: 'integer' }, why: { type: 'string' } },
        required: ['name', 'appeal', 'why']
      }
    },
    competitors: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, positioning: { type: 'string' }, threat: { type: 'string', enum: ['low', 'medium', 'high'] } },
        required: ['name', 'positioning', 'threat']
      }
    },
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { risk: { type: 'string' }, severity: { type: 'string', enum: ['low', 'medium', 'high'] }, mitigation: { type: 'string' } },
        required: ['risk', 'severity', 'mitigation']
      }
    },
    channels: { type: 'array', items: { type: 'string' } },
    partners: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, role: { type: 'string' }, fit: { type: 'integer' }, why: { type: 'string' } },
        required: ['name', 'role', 'fit', 'why']
      }
    },
    neighborhoods: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, score: { type: 'integer' }, note: { type: 'string' } },
        required: ['name', 'score', 'note']
      }
    }
  },
  required: ['verdict', 'confidence', 'opportunityIndex', 'headline', 'verdictRationale', 'memoIntro', 'agents', 'affinity', 'segments', 'competitors', 'risks', 'channels', 'partners', 'neighborhoods']
};

class QlooError extends Error {
  constructor(message) {
    super(message);
    this.code = 'qloo_unavailable';
  }
}

async function qlooGet(path, params) {
  const url = new URL(QLOO_BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  let res;
  try {
    res = await fetch(url, {
      headers: { 'X-Api-Key': secrets.get('QLOO_API_KEY'), Accept: 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
  } catch (err) {
    throw new QlooError(`Qloo request failed: ${err.message}`);
  }
  if (res.ok) {
    const json = await res.json().catch(() => null);
    if (json === null) throw new QlooError('Qloo returned an unreadable response');
    return json;
  }
  if (res.status === 404) return null; // "No results" is a legitimate empty set, not a failure
  throw new QlooError(`Qloo ${path} responded with status ${res.status}`);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const brandName = typeof body?.brandName === 'string' ? body.brandName.trim().slice(0, 80) : '';
    const city = body?.city;
    const category = body?.category;
    const lang = body?.lang === 'vi' ? 'vi' : 'en';
    const hoodNames = Array.isArray(body?.neighborhoods)
      ? body.neighborhoods.filter((n) => typeof n === 'string' && n.length >= 1 && n.length <= 60).slice(0, 15)
      : [];

    if (!brandName || !CITY_COORDS[city] || !CATEGORIES[category]) {
      return Response.json({ error: 'Invalid analysis request' }, { status: 400 });
    }
    if (hoodNames.length === 0) {
      return Response.json({ error: 'Missing neighborhood list' }, { status: 400 });
    }

    // ---------- Qloo Taste AI evidence (server-side only) ----------
    const brandSearch = await qlooGet('/search', { query: brandName, types: 'urn:entity:brand', take: 5 });
    const brandEntity = (brandSearch?.results || [])[0] || null;

    const catBrandSearch = await qlooGet('/search', { query: CATEGORIES[category].brandTerm, types: 'urn:entity:brand', take: 5 });
    const categoryEntities = (catBrandSearch?.results || []).slice(0, 3);

    const signalIds = brandEntity
      ? [brandEntity.entity_id]
      : categoryEntities.map((e) => e.entity_id).filter(Boolean);

    if (signalIds.length === 0) {
      return Response.json(
        { error: 'No taste data available for this brand or category.', code: 'qloo_unavailable' },
        { status: 502 }
      );
    }

    const insights = await qlooGet('/v2/insights', {
      'signal.interests.entities': signalIds.join(','),
      'filter.type': 'urn:entity:brand',
      take: 12
    });
    const relatedBrands = ((insights?.results?.entities) || [])
      .filter((e) => e && e.name)
      .map((e) => ({
        name: String(e.name).slice(0, 80),
        affinity: typeof e.query?.affinity === 'number' ? Math.round(e.query.affinity * 100) / 100 : null
      }))
      .slice(0, 8);

    const placeSearch = await qlooGet('/search', {
      query: CATEGORIES[category].placeTerm,
      types: 'urn:entity:place',
      'filter.location': CITY_COORDS[city],
      'filter.radius': 10,
      take: 10,
      sort_by: 'popularity'
    });
    const cityPlaces = (placeSearch?.results || []).map((e) => e?.name).filter(Boolean).slice(0, 8);

    const brandTags = (brandEntity?.tags || [])
      .slice(0, 14)
      .map((tag) => {
        if (typeof tag === 'string') return tag;
        return tag?.name || tag?.tag || tag?.label || '';
      })
      .filter(Boolean);

    // ---------- Agent reasoning (LLM over the evidence) ----------
    const languageInstruction = lang === 'vi'
      ? 'Write every piece of human-readable text (summaries, findings, segment names, rationale, memo intro) in Vietnamese.'
      : 'Write every piece of human-readable text in English.';

    const evidenceLines = [
      `- Brand match: ${brandEntity ? `"${brandEntity.name}" (Qloo entity, popularity ${typeof brandEntity.popularity === 'number' ? brandEntity.popularity.toFixed(2) : 'n/a'})` : `No Qloo brand entity found for "${brandName}" — category-level taste signals were used instead.`}`,
      `- Taste tags: ${brandTags.length > 0 ? brandTags.join(', ') : 'none available'}`,
      `- Related brands with measured Qloo affinity (0-1): ${relatedBrands.length > 0 ? relatedBrands.map((b) => `${b.name} ${b.affinity ?? 'n/a'}`).join(', ') : 'none available'}`,
      `- Popular ${CATEGORIES[category].placeTerm}s in ${CITY_NAMES[city]} per Qloo: ${cityPlaces.length > 0 ? cityPlaces.join(', ') : 'none available'}`
    ].join('\n');

    const prompt = `You are TasteBridge — a rigorous market-entry analyst for consumer brands entering Vietnam. You run a pipeline of 11 specialist agents and produce one structured verdict.

BRIEF
- Brand: ${brandName}
- Category: ${CATEGORIES[category].label}
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

NEIGHBORHOODS — score each of these districts in ${CITY_NAMES[city]} as a first-store opportunity for this brand (0-100) with a one-line note:
${hoodNames.join(', ')}

OUTPUT RULES
- ${languageInstruction}
- Each agent: summary is one sentence (max ~220 characters); findings are two short bullets (max ~140 characters each).
- Be specific to ${CITY_NAMES[city]} and the ${CATEGORIES[category].label} category. No generic filler.
- Never fabricate statistics, market-share numbers or ratings.`;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: RESPONSE_SCHEMA
    });

    let parsed = llm;
    if (parsed && typeof parsed === 'object' && !parsed.verdict && parsed.response) parsed = parsed.response;
    if (!parsed || !['GO', 'PILOT', 'NO-GO'].includes(parsed.verdict)) {
      return Response.json({ error: 'Agent reasoning failed to produce a verdict.' }, { status: 502 });
    }

    const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
    const str = (v, max) => String(v ?? '').slice(0, max);
    const level = (v) => (['low', 'medium', 'high'].includes(v) ? v : 'medium');

    const result = {
      verdict: parsed.verdict,
      confidence: clamp(parsed.confidence),
      opportunityIndex: clamp(parsed.opportunityIndex),
      headline: str(parsed.headline, 300),
      verdictRationale: str(parsed.verdictRationale, 1200),
      memoIntro: str(parsed.memoIntro, 1500),
      agents: (Array.isArray(parsed.agents) ? parsed.agents : [])
        .filter((a) => a && AGENT_IDS.includes(a.id))
        .map((a) => ({
          id: a.id,
          summary: str(a.summary, 400),
          findings: (Array.isArray(a.findings) ? a.findings : []).slice(0, 3).map((f) => str(f, 300))
        })),
      affinity: {
        overall: clamp(parsed.affinity?.overall),
        cultural: clamp(parsed.affinity?.cultural),
        audience: clamp(parsed.affinity?.audience),
        competition: clamp(parsed.affinity?.competition),
        price: clamp(parsed.affinity?.price)
      },
      segments: (Array.isArray(parsed.segments) ? parsed.segments : []).slice(0, 5).map((s) => ({
        name: str(s?.name, 80), appeal: clamp(s?.appeal), why: str(s?.why, 300)
      })),
      competitors: (Array.isArray(parsed.competitors) ? parsed.competitors : []).slice(0, 6).map((c) => ({
        name: str(c?.name, 80), positioning: str(c?.positioning, 300), threat: level(c?.threat)
      })),
      risks: (Array.isArray(parsed.risks) ? parsed.risks : []).slice(0, 5).map((r) => ({
        risk: str(r?.risk, 300), severity: level(r?.severity), mitigation: str(r?.mitigation, 300)
      })),
      channels: (Array.isArray(parsed.channels) ? parsed.channels : []).slice(0, 4).map((c) => str(c, 200)),
      partners: (Array.isArray(parsed.partners) ? parsed.partners : []).slice(0, 4).map((p) => ({
        name: str(p?.name, 80), role: str(p?.role, 120), fit: clamp(p?.fit), why: str(p?.why, 300)
      })),
      neighborhoods: (Array.isArray(parsed.neighborhoods) ? parsed.neighborhoods : [])
        .filter((n) => n && hoodNames.includes(n.name))
        .map((n) => ({ name: String(n.name), score: clamp(n.score), note: str(n.note, 200) }))
    };

    if (result.agents.length === 0) {
      return Response.json({ error: 'Agent reasoning returned no agent outputs.' }, { status: 502 });
    }

    return Response.json({
      ok: true,
      result,
      evidence: {
        brandFound: Boolean(brandEntity),
        matchedName: brandEntity ? brandEntity.name : null,
        brandTags,
        relatedBrands,
        cityPlaces
      },
      inputs: { brandName, city, category: CATEGORIES[category].label, lang }
    });
  } catch (error) {
    if (error && error.code === 'qloo_unavailable') {
      return Response.json(
        { error: 'Taste AI data is unavailable. No analysis was produced.', code: 'qloo_unavailable' },
        { status: 502 }
      );
    }
    return Response.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
/**
 * Agent registry. Each agent = role prompt + allowed Qloo tools + model tier + output contract.
 * To add an agent (e.g. supplier, legal, hiring), add an entry here and reference it from the pipeline.
 */
import type { AgentId, Lang, RunInput } from "../types";
import type { RunState } from "../tools";
import type { Tier } from "../llm";

export interface AgentDef {
  id: AgentId;
  name: { en: string; vi: string };
  role: { en: string; vi: string };
  tier: Tier;
  tools: string[];
  maxSteps: number;
  system: (s: RunState, input: RunInput) => string;
  user: (s: RunState, input: RunInput, ctx: Record<string, any>) => string;
  /** JSON shape the final answer must follow (described to the model). */
  output?: string;
  /** Final JSON must contain one entry per target city under `cities`. */
  perCity?: boolean;
}

const langLine = (l: Lang) => (l === "vi" ? "Write every human-readable string in Vietnamese." : "Write every human-readable string in English.");
const NO_INVENT = "Never invent numbers. Only cite figures that appear in tool results or the provided evidence digest, and name the city they belong to. Write for a business reader: use plain words (e.g. 'saturated share', 'taste-matched venues', 'best neighborhood'), never raw JSON field names like saturatedShare or best_neighborhood.";
const cityList = (s: RunState) => s.cityIds.map((id) => `${id} (${s.cities[id].cityName})`).join(", ");
const marketLine = (s: RunState) =>
  s.pack.direction === "inbound"
    ? `The brand is a foreign F&B brand evaluating entry into ${s.pack.country.en}. Target cities: ${cityList(s)}.`
    : `The brand is a Vietnamese F&B brand evaluating expansion abroad. Target cities: ${cityList(s)}.`;

export const AGENTS: Record<AgentId, AgentDef> = {
  profiler: {
    id: "profiler",
    name: { en: "Brand Profiler", vi: "Hồ sơ thương hiệu" },
    role: { en: "Maps the brand and its signature items to Qloo entities and taste tags.", vi: "Ánh xạ thương hiệu và món đặc trưng sang thực thể và thẻ khẩu vị Qloo." },
    tier: "large",
    tools: ["search_brand_locations", "search_taste_tags", "set_brand_profile", "brand_demographics"],
    maxSteps: 7,
    system: (s) =>
      `You are the Brand Profiler of TasteBridge, a market-entry advisor. ${marketLine(s)}
Steps: 1) search_brand_locations for the brand (prefer the brand's own flagship/home-market venues with high popularity; ignore unrelated names). 2) search_taste_tags for its category and 1-2 signature items. 3) set_brand_profile. 4) brand_demographics. Call tools in parallel when possible. Finish with a one-line plain-text summary.`,
    user: (_s, i) => `Brand: ${i.brand}${i.homeCity ? ` (home market: ${i.homeCity})` : ""}. Signature items: ${i.signatureItems || "not given"}. Website: ${i.website || "n/a"}.`,
  },
  scout: {
    id: "scout",
    name: { en: "Market Scout", vi: "Trinh sát thị trường" },
    role: { en: "Measures audience affinity and neighborhood heat per city.", vi: "Đo mức độ hợp khẩu vị và bản đồ nhiệt theo khu vực." },
    tier: "small",
    tools: ["city_audience_fit", "city_heatmap"],
    maxSteps: 4,
    system: (s) => `You are the Market Scout. ${marketLine(s)} Call city_audience_fit AND city_heatmap for EVERY city (parallel calls are fine). Then reply with 2-3 sentences comparing the cities. ${NO_INVENT}`,
    user: (s) => `Scout these cities: ${s.cityIds.join(", ")}.`,
  },
  analog: {
    id: "analog",
    name: { en: "Analog Hunter", vi: "Săn mô hình tương tự" },
    role: { en: "Finds comparable venues already thriving (proof of demand) and saturation.", vi: "Tìm mô hình tương tự đang thành công (bằng chứng nhu cầu) và mức bão hoà." },
    tier: "large",
    tools: ["category_analogs", "search_taste_tags"],
    maxSteps: 5,
    system: (s) => `You are the Analog Hunter. ${marketLine(s)} Brand category tag: ${s.profile.categoryTag}. Call category_analogs for EVERY city. If a city returns 0, look up a better tag with search_taste_tags and retry once. Then reply with 2-3 sentences on demand proof and saturation. ${NO_INVENT}`,
    user: (s) => `Cities: ${s.cityIds.join(", ")}.`,
  },
  culture: {
    id: "culture",
    name: { en: "Culture Mapper", vi: "Bản đồ văn hoá" },
    role: { en: "Maps cross-domain tastes (music, film, people, brands) into marketing angles.", vi: "Khai thác khẩu vị liên ngành (nhạc, phim, người nổi tiếng, thương hiệu) thành góc truyền thông." },
    tier: "small",
    tools: ["cross_domain_tastes"],
    maxSteps: 5,
    system: (s, i) => `You are the Culture Mapper. ${marketLine(s)} For EVERY city call cross_domain_tastes for domains artist, tv_show and brand (parallel). Then return JSON {"angles":[{"city_id":"","angle":"","collab":"","kol_profile":""}]} with one marketing angle per city based ONLY on returned names. ${langLine(i.lang)}`,
    user: (s) => `Cities: ${s.cityIds.join(", ")}.`,
  },
  localize: {
    id: "localize",
    name: { en: "Localization Chef", vi: "Bếp trưởng bản địa hoá" },
    role: { en: "Turns local taste signals into menu tweaks, positioning and price tier.", vi: "Biến tín hiệu khẩu vị địa phương thành điều chỉnh thực đơn, định vị và mức giá." },
    tier: "small",
    tools: ["local_taste_profile"],
    maxSteps: 4,
    system: (s, i) => `You are the Localization Chef. ${marketLine(s)} Call local_taste_profile for EVERY city. Then return JSON {"cities":[{"city_id":"","menu_tweaks":["",""],"positioning":"","price_tier":"","rationale":""}]}. Base menu tweaks on the returned menu highlights; price_tier relative to the returned Qloo price levels (1-4). ${NO_INVENT} ${langLine(i.lang)}`,
    user: (_s, i) => `Brand signature items: ${i.signatureItems || "see profile"}.`,
  },
  bull: {
    id: "bull",
    perCity: true,
    name: { en: "Bull Analyst", vi: "Phe lạc quan" },
    role: { en: "Argues the strongest evidence-based case FOR investing.", vi: "Đưa luận điểm mạnh nhất ỦNG HỘ đầu tư dựa trên bằng chứng." },
    tier: "small",
    tools: [],
    maxSteps: 1,
    output: `{"cities":[{"city_id":"","points":["","",""]}]}`,
    system: (_s, i) => `You are the Bull analyst on an investment committee. Make the strongest case FOR entering each city, max 3 short points per city, each citing a figure from the digest. ${NO_INVENT} ${langLine(i.lang)} Reply JSON only.`,
    user: (s, _i, ctx) => `Cover every city_id: ${s.cityIds.join(", ")}.\nEvidence digest:\n${ctx.digest}`,
  },
  bear: {
    id: "bear",
    perCity: true,
    name: { en: "Bear Analyst", vi: "Phe thận trọng" },
    role: { en: "Argues the strongest evidence-based case AGAINST investing.", vi: "Đưa luận điểm mạnh nhất PHẢN ĐỐI đầu tư dựa trên bằng chứng." },
    tier: "large",
    tools: [],
    maxSteps: 1,
    output: `{"cities":[{"city_id":"","points":["","",""]}]}`,
    system: (_s, i) => `You are the Bear analyst on an investment committee. Make the strongest case AGAINST entering each city (saturation, weak affinity, thin data, audience mismatch), max 3 short points per city, each citing a figure from the digest. ${NO_INVENT} ${langLine(i.lang)} Reply JSON only.`,
    user: (s, _i, ctx) => `Cover every city_id: ${s.cityIds.join(", ")}.\nEvidence digest:\n${ctx.digest}`,
  },
  chair: {
    id: "chair",
    perCity: true,
    name: { en: "Committee Chair", vi: "Chủ tịch hội đồng" },
    role: { en: "Weighs bull vs bear and issues the verdict, budget band and top risks.", vi: "Cân nhắc hai phe, ra phán quyết, dải ngân sách và rủi ro chính." },
    tier: "large",
    tools: [],
    maxSteps: 1,
    output: `{"cities":[{"city_id":"","rationale":"","risks":["","",""],"first_move":""}],"recommendation":""}`,
    system: (_s, i) => `You chair the investment committee. The verdict, score and budget band per city are FIXED by the deterministic Taste-Fit model in the digest; do not change them. Explain each verdict in 2 sentences weighing bull vs bear, list exactly 3 risks, and a concrete first move. Then a one-paragraph overall recommendation naming where to put money first; it must match the fixed verdicts (full launch only in GO cities, pilots only in PILOT cities, nothing in NO-GO cities). ${NO_INVENT} ${langLine(i.lang)} Reply JSON only.`,
    user: (s, _i, ctx) => `Cover every city_id: ${s.cityIds.join(", ")}.\nDigest:\n${ctx.digest}\n\nBull:\n${ctx.bull}\n\nBear:\n${ctx.bear}`,
  },
  launch: {
    id: "launch",
    perCity: true,
    name: { en: "A–Z Launch Planner", vi: "Kế hoạch ra mắt A–Z" },
    role: { en: "Builds the 90-day rollout: neighborhood, menu, marketing, KOLs, monitoring.", vi: "Lập lộ trình 90 ngày: khu vực, thực đơn, marketing, KOL, giám sát." },
    tier: "large",
    tools: [],
    maxSteps: 1,
    output: `{"cities":[{"city_id":"","neighborhood":"","why_here":"","launch_format":"","marketing":["",""],"kol_collabs":["",""],"timeline":[{"phase":"Days 1-30","actions":["",""]},{"phase":"Days 31-60","actions":[""]},{"phase":"Days 61-90","actions":[""]}],"monitoring":["",""]}]}`,
    system: (_s, i) => `You are the A-Z Launch Planner. For each GO or PILOT city in the digest, build a 90-day launch plan. neighborhood must come from the digest's best_neighborhood or venue neighborhoods; kol_collabs must reuse names from the culture data; monitoring = which Qloo signals to re-check monthly (affinity, heat, analog popularity). PILOT cities get a pop-up / shop-in-shop format. ${NO_INVENT} ${langLine(i.lang)} Reply JSON only.`,
    user: (_s, _i, ctx) => `Plan for these city_ids: ${(ctx.goCities || []).join(", ")}.\nDigest:\n${ctx.digest}\nLocalization:\n${ctx.localize}`,
  },
  validate: {
    id: "validate",
    name: { en: "Demand Validator", vi: "Kiểm chứng nhu cầu" },
    role: { en: "Writes a localized pre-order landing page and ads aimed at the taste-matched audience.", vi: "Viết landing page đặt trước và quảng cáo nhắm đúng tệp khẩu vị." },
    tier: "small",
    tools: [],
    maxSteps: 1,
    output: `{"city_id":"","landing":{"headline_local":"","headline_en":"","subhead_local":"","bullets_local":["","",""],"cta_local":"","offer":""},"ads":[{"channel":"","copy_local":"","copy_en":"","audience":""}],"success_metric":""}`,
    system: (s) => `You are the Demand Validator ("test before you invest"). For the best city in the digest, write a pre-order landing page in the local language (${s.pack.direction === "inbound" ? "Vietnamese" : "the target city's main language"}) with English translation, plus 3 ad variants (TikTok, Facebook/Instagram, Google) aimed at the audience whose age/gender skew is in the digest. Mention dishes from the localization plan. Do not invent statistics; success_metric is a pre-order count target the founder sets, phrase it as a template. Reply JSON only.`,
    user: (_s, i, ctx) => `Brand: ${i.brand}\nDigest:\n${ctx.digest}\nLocalization:\n${ctx.localize}`,
  },
  partners: {
    id: "partners",
    name: { en: "Partner Matchmaker", vi: "Kết nối đối tác" },
    role: { en: "Defines the local partner roles and selection criteria for the launch.", vi: "Xác định vai trò và tiêu chí chọn đối tác địa phương." },
    tier: "small",
    tools: [],
    maxSteps: 1,
    output: `{"roles":[{"role_id":"","priority":1,"city_ids":[""],"brief":"","must_have":["",""],"red_flags":[""]}]}`,
    system: (_s, i) => `You are the Partner Matchmaker. From the market pack's partner roles, order them by priority for this launch and tailor a brief + must-have criteria + red flags to the verdicts and neighborhoods in the digest. Do NOT name real companies; describe profiles only. ${langLine(i.lang)} Reply JSON only.`,
    user: (s, _i, ctx) => `Partner roles: ${JSON.stringify(s.pack.partnerRoles.map((r) => ({ id: r.id, name: r.name.en, why: r.why.en })))}\nDigest:\n${ctx.digest}`,
  },
};

export const PIPELINE: AgentId[] = ["profiler", "scout", "analog", "culture", "localize", "bull", "bear", "chair", "launch", "validate", "partners"];

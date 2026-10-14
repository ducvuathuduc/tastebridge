/** Shared types between the agent pipeline (server) and the UI (client). */

export type Lang = "en" | "vi";

export interface RunInput {
  brand: string;
  /** Optional: home city, used to disambiguate the brand's Qloo entity */
  homeCity?: string;
  signatureItems?: string;
  website?: string;
  pack: string;
  cities: string[];
  lang: Lang;
  /** The founder's own first-phase budget ceiling, used only to express budget bands as shares of it. */
  budget?: { amount: number; currency: "USD" | "VND" };
}

/** One real number taken from one real Qloo response. The UI only displays figures from here. */
export interface Evidence {
  id: string;
  label: string;
  value: number | string;
  city?: string;
  source: string; // key-free Qloo request URL
}

export interface PlaceLite {
  id: string;
  name: string;
  affinity?: number;
  popularity?: number;
  neighborhood?: string;
  address?: string;
  priceLevel?: number;
  lat?: number;
  lng?: number;
  tags?: string[];
}

export interface HeatCell { lat: number; lng: number; affinity: number; popularity: number }

export interface CityData {
  cityId: string;
  cityName: string;
  locality?: string;
  similar: PlaceLite[]; // F&B places whose audience overlaps the brand's
  similarAll: number; // total returned before the F&B filter
  analogs: PlaceLite[]; // places in the brand's category in this city
  analogTag?: string;
  heat: HeatCell[];
  culture: Record<string, { name: string; affinity?: number }[]>;
  localTaste: { tag: string; count: number }[];
  priceLevels: Record<string, number>;
}

export interface ScoreBreakdown {
  score: number; // 0..100
  verdict: "GO" | "PILOT" | "NO-GO";
  confidence: "high" | "medium" | "low";
  parts: { audienceFit: number; demandProof: number; whitespace: number };
  inputs: { meanAffinity: number; fnbMatches: number; analogCount: number; analogMeanPopularity: number; saturatedShare: number; heatCells: number };
}

export interface BrandProfile {
  name: string;
  anchors: { id: string; name: string; address?: string; popularity?: number }[];
  tags: { id: string; name: string }[];
  categoryTag?: string;
  demographics?: { age: Record<string, number>; gender: Record<string, number> };
  summary: string;
}

export type AgentId =
  | "profiler" | "scout" | "analog" | "culture" | "localize"
  | "bull" | "bear" | "chair" | "launch" | "validate" | "partners";

export type RunEvent =
  | { type: "run_start"; runId: string; input: RunInput; agents: { id: AgentId; name: string }[] }
  | { type: "agent_start"; agent: AgentId; model?: string }
  | { type: "tool_call"; agent: AgentId; tool: string; args: Record<string, unknown>; callId: string }
  | { type: "tool_result"; agent: AgentId; callId: string; summary: string; ok: boolean }
  | { type: "agent_thought"; agent: AgentId; text: string }
  | { type: "agent_done"; agent: AgentId; output: any; model?: string; ms: number }
  | { type: "agent_error"; agent: AgentId; error: string }
  | { type: "profile"; profile: BrandProfile }
  | { type: "city_data"; data: CityData }
  | { type: "scores"; scores: Record<string, ScoreBreakdown> }
  | { type: "evidence"; items: Evidence[] }
  | { type: "done"; ms: number }
  | { type: "fatal"; error: string };

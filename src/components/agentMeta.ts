import { Search, Radar, Store, Music, ChefHat, TrendingUp, TrendingDown, Gavel, Rocket, Megaphone, Handshake, type LucideIcon } from "lucide-react";
import type { AgentId } from "@/lib/types";

/** Client-side mirror of the agent registry (display only). */
export const AGENT_META: { id: AgentId; icon: LucideIcon; tint: string; name: { en: string; vi: string }; role: { en: string; vi: string }; tools: string[] }[] = [
  { id: "profiler", icon: Search, tint: "#fdf1dc", name: { en: "Brand Profiler", vi: "Hồ sơ thương hiệu" }, role: { en: "Maps the brand and signature items to Qloo entities and taste tags.", vi: "Ánh xạ thương hiệu và món đặc trưng sang thực thể và thẻ khẩu vị Qloo." }, tools: ["search", "tags", "demographics"] },
  { id: "scout", icon: Radar, tint: "#e3f4ec", name: { en: "Market Scout", vi: "Trinh sát thị trường" }, role: { en: "Measures audience affinity and neighborhood heat per city.", vi: "Đo độ hợp khẩu vị và bản đồ nhiệt theo khu vực." }, tools: ["insights", "heatmap"] },
  { id: "analog", icon: Store, tint: "#edf0f5", name: { en: "Analog Hunter", vi: "Săn mô hình tương tự" }, role: { en: "Finds comparable venues already thriving and measures saturation.", vi: "Tìm mô hình tương tự đang thành công và đo mức bão hoà." }, tools: ["insights · filter.tags"] },
  { id: "culture", icon: Music, tint: "#f3e8ff", name: { en: "Culture Mapper", vi: "Bản đồ văn hoá" }, role: { en: "Turns cross-domain tastes into marketing angles, collabs and KOLs.", vi: "Biến khẩu vị liên ngành thành góc truyền thông, collab và KOL." }, tools: ["artist", "tv_show", "brand"] },
  { id: "localize", icon: ChefHat, tint: "#fde7e4", name: { en: "Localization Chef", vi: "Bếp trưởng bản địa hoá" }, role: { en: "Menu tweaks, positioning and price tier from local taste signals.", vi: "Chỉnh thực đơn, định vị, mức giá từ tín hiệu khẩu vị địa phương." }, tools: ["local taste profile"] },
  { id: "bull", icon: TrendingUp, tint: "#e3f4ec", name: { en: "Bull Analyst", vi: "Phe lạc quan" }, role: { en: "Makes the strongest evidence-based case for investing.", vi: "Đưa luận điểm mạnh nhất ủng hộ đầu tư." }, tools: [] },
  { id: "bear", icon: TrendingDown, tint: "#fde7e4", name: { en: "Bear Analyst", vi: "Phe thận trọng" }, role: { en: "Makes the strongest evidence-based case against investing.", vi: "Đưa luận điểm mạnh nhất phản đối đầu tư." }, tools: [] },
  { id: "chair", icon: Gavel, tint: "#fdf1dc", name: { en: "Committee Chair", vi: "Chủ tịch hội đồng" }, role: { en: "Rules on each city: rationale, budget band, top three risks.", vi: "Ra phán quyết từng thành phố: lý do, dải ngân sách, ba rủi ro." }, tools: [] },
  { id: "launch", icon: Rocket, tint: "#edf0f5", name: { en: "A–Z Launch Planner", vi: "Kế hoạch ra mắt A–Z" }, role: { en: "Neighborhood, format, marketing, KOLs and a 90-day rollout.", vi: "Khu vực, mô hình, marketing, KOL và lộ trình 90 ngày." }, tools: [] },
  { id: "validate", icon: Megaphone, tint: "#f3e8ff", name: { en: "Demand Validator", vi: "Kiểm chứng nhu cầu" }, role: { en: "Pre-order landing page and ads aimed at the taste-matched audience.", vi: "Trang đặt trước và quảng cáo nhắm đúng tệp khẩu vị." }, tools: [] },
  { id: "partners", icon: Handshake, tint: "#e3f4ec", name: { en: "Partner Matchmaker", vi: "Kết nối đối tác" }, role: { en: "Local partner roles, briefs, must-haves and red flags.", vi: "Vai trò đối tác địa phương, yêu cầu và dấu hiệu cảnh báo." }, tools: [] },
];
export const agentMeta = (id: AgentId) => AGENT_META.find((a) => a.id === id)!;

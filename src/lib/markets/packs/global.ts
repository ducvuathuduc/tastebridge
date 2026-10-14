import type { MarketPack } from "../types";

/** Outbound pack: Vietnamese F&B brands expanding abroad (secondary direction). */
export const global: MarketPack = {
  id: "global",
  country: { en: "Asia-Pacific & US", vi: "Châu Á - Thái Bình Dương & Mỹ" },
  direction: "outbound",
  locale: "en-US",
  currency: { code: "USD", symbol: "$" },
  cities: [
    { id: "tokyo", qlooQuery: "Tokyo", name: { en: "Tokyo", vi: "Tokyo" }, coverage: "deep", center: [35.6762, 139.6503] },
    { id: "seoul", qlooQuery: "Seoul", name: { en: "Seoul", vi: "Seoul" }, coverage: "deep", center: [37.5665, 126.978] },
    { id: "sydney", qlooQuery: "Sydney", name: { en: "Sydney", vi: "Sydney" }, coverage: "deep", center: [-33.8688, 151.2093] },
    { id: "la", qlooQuery: "Los Angeles", name: { en: "Los Angeles", vi: "Los Angeles" }, coverage: "deep", center: [34.0522, -118.2437] },
    { id: "singapore", qlooQuery: "Singapore", name: { en: "Singapore", vi: "Singapore" }, coverage: "deep", center: [1.3521, 103.8198] },
    { id: "bangkok", qlooQuery: "Bangkok", name: { en: "Bangkok", vi: "Bangkok" }, coverage: "medium", center: [13.7563, 100.5018] },
  ],
  defaultCities: ["tokyo", "seoul", "sydney"],
  partnerRoles: [
    { id: "master-franchisee", name: { en: "Master franchisee / local operator", vi: "Đối tác nhượng quyền chính" }, why: { en: "Runs the market on the ground.", vi: "Vận hành thị trường tại chỗ." }, criteria: { en: ["F&B operating track record in target city", "Capital for pilot"], vi: ["Kinh nghiệm vận hành F&B tại thành phố", "Vốn cho thí điểm"] } },
    { id: "site-broker", name: { en: "Retail site broker", vi: "Môi giới mặt bằng" }, why: { en: "Finds frontage in the hottest taste cell.", vi: "Tìm mặt bằng tại ô nhiệt cao nhất." }, criteria: { en: ["Inventory in recommended district"], vi: ["Có mặt bằng tại khu đề xuất"] } },
    { id: "trade-promotion", name: { en: "Trade-promotion agency", vi: "Cơ quan xúc tiến thương mại" }, why: { en: "Export support and matchmaking (e.g. VIETRADE).", vi: "Hỗ trợ xuất khẩu và kết nối (ví dụ VIETRADE)." }, criteria: { en: ["Market-entry programs for F&B"], vi: ["Chương trình gia nhập thị trường cho F&B"] } },
    { id: "kol-agency", name: { en: "KOL & social agency", vi: "Agency KOL" }, why: { en: "Diaspora + mainstream launch reach.", vi: "Tiếp cận cộng đồng kiều bào và đại chúng." }, criteria: { en: ["Food creators in target city"], vi: ["Creator ẩm thực tại thành phố"] } },
  ],
  regulatoryNotes: { en: ["Check local franchise disclosure and food import rules per country."], vi: ["Kiểm tra quy định công bố nhượng quyền và nhập khẩu thực phẩm từng nước."] },
};

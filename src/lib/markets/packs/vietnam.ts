import type { MarketPack } from "../types";

/** Inbound pack: foreign F&B brands entering Vietnam (TasteBridge's primary market). */
export const vietnam: MarketPack = {
  id: "vn",
  country: { en: "Vietnam", vi: "Việt Nam" },
  direction: "inbound",
  locale: "vi-VN",
  currency: { code: "VND", symbol: "₫" },
  cities: [
    { id: "hcmc", qlooQuery: "Ho Chi Minh City", name: { en: "Ho Chi Minh City", vi: "TP. Hồ Chí Minh" }, coverage: "deep", center: [10.7769, 106.7009] },
    { id: "hanoi", qlooQuery: "Hanoi", name: { en: "Hanoi", vi: "Hà Nội" }, coverage: "deep", center: [21.0285, 105.8542] },
    { id: "danang", qlooQuery: "Da Nang", name: { en: "Da Nang", vi: "Đà Nẵng" }, coverage: "deep", center: [16.0544, 108.2022] },
    { id: "hoian", qlooQuery: "Hoi An", name: { en: "Hoi An", vi: "Hội An" }, coverage: "medium", center: [15.8801, 108.338] },
    { id: "nhatrang", qlooQuery: "Nha Trang", name: { en: "Nha Trang", vi: "Nha Trang" }, coverage: "thin", center: [12.2388, 109.1967] },
    { id: "haiphong", qlooQuery: "Hai Phong", name: { en: "Hai Phong", vi: "Hải Phòng" }, coverage: "thin", center: [20.8449, 106.6881] },
    { id: "cantho", qlooQuery: "Can Tho", name: { en: "Can Tho", vi: "Cần Thơ" }, coverage: "thin", center: [10.0452, 105.7469] },
    { id: "dalat", qlooQuery: "Da Lat", name: { en: "Da Lat", vi: "Đà Lạt" }, coverage: "thin", center: [11.9404, 108.4583] },
  ],
  defaultCities: ["hcmc", "hanoi", "danang"],
  partnerRoles: [
    {
      id: "master-franchisee",
      name: { en: "Master franchisee / local operator", vi: "Đối tác nhượng quyền chính / nhà vận hành" },
      why: { en: "Owns P&L, staffing and expansion in-country.", vi: "Chịu trách nhiệm P&L, nhân sự và mở rộng tại Việt Nam." },
      criteria: {
        en: ["Runs ≥1 F&B concept in the target city", "Capital to fund the pilot phase", "Track record with foreign brand standards"],
        vi: ["Đang vận hành ≥1 mô hình F&B tại thành phố mục tiêu", "Đủ vốn cho giai đoạn thí điểm", "Kinh nghiệm theo chuẩn thương hiệu nước ngoài"],
      },
    },
    {
      id: "site-broker",
      name: { en: "Retail site broker", vi: "Môi giới mặt bằng bán lẻ" },
      why: { en: "Secures frontage in the taste-matched neighborhood from the heatmap.", vi: "Tìm mặt bằng tại khu vực có độ hợp khẩu vị cao trên bản đồ nhiệt." },
      criteria: { en: ["Listings in the recommended district", "Mall + street-front inventory"], vi: ["Có nguồn mặt bằng tại quận đề xuất", "Cả trung tâm thương mại và mặt phố"] },
    },
    {
      id: "franchise-legal",
      name: { en: "Franchise & F&B legal counsel", vi: "Tư vấn pháp lý nhượng quyền & F&B" },
      why: { en: "Foreign franchisors register franchising activity with the Ministry of Industry and Trade before operating.", vi: "Bên nhượng quyền nước ngoài cần đăng ký hoạt động nhượng quyền với Bộ Công Thương trước khi hoạt động." },
      criteria: { en: ["Franchise registration experience", "Food safety certification support"], vi: ["Kinh nghiệm đăng ký nhượng quyền", "Hỗ trợ chứng nhận an toàn thực phẩm"] },
    },
    {
      id: "supply-chain",
      name: { en: "Import, cold-chain & local sourcing", vi: "Nhập khẩu, chuỗi lạnh & nguồn cung nội địa" },
      why: { en: "Signature ingredients either imported or substituted locally.", vi: "Nguyên liệu đặc trưng nhập khẩu hoặc thay thế bằng nguồn trong nước." },
      criteria: { en: ["Customs + cold-chain capability", "Local supplier substitutes for key SKUs"], vi: ["Năng lực hải quan và chuỗi lạnh", "Nhà cung cấp nội địa thay thế SKU chính"] },
    },
    {
      id: "kol-agency",
      name: { en: "KOL & social agency", vi: "Agency KOL & mạng xã hội" },
      why: { en: "Launch buzz on TikTok, Facebook and Instagram aimed at the taste-matched audience.", vi: "Tạo tiếng vang ra mắt trên TikTok, Facebook, Instagram tới đúng tệp khẩu vị." },
      criteria: { en: ["Food/lifestyle creator roster", "Bilingual content"], vi: ["Mạng lưới creator ẩm thực/lifestyle", "Nội dung song ngữ"] },
    },
    {
      id: "delivery",
      name: { en: "Delivery & POS integration", vi: "Giao hàng & tích hợp POS" },
      why: { en: "Delivery apps are a major F&B channel in Vietnamese cities.", vi: "Ứng dụng giao đồ ăn là kênh F&B lớn ở các đô thị Việt Nam." },
      criteria: { en: ["Onboarding with major delivery platforms", "POS that supports VND e-invoicing"], vi: ["Kết nối các nền tảng giao hàng lớn", "POS hỗ trợ hoá đơn điện tử VND"] },
    },
  ],
  regulatoryNotes: {
    en: [
      "Franchise registration with the Ministry of Industry and Trade (MOIT) for foreign franchisors.",
      "Food safety certificate for each outlet.",
      "Personal data of Vietnamese customers falls under Vietnam's Personal Data Protection Law.",
    ],
    vi: [
      "Bên nhượng quyền nước ngoài đăng ký nhượng quyền với Bộ Công Thương.",
      "Giấy chứng nhận đủ điều kiện an toàn thực phẩm cho từng cửa hàng.",
      "Dữ liệu cá nhân khách hàng Việt Nam tuân theo Luật Bảo vệ dữ liệu cá nhân.",
    ],
  },
};

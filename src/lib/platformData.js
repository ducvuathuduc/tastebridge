export const packs = [
  {
    id: "vietnam",
    name: { en: "Vietnam", vi: "Việt Nam" },
    live: true,
    dataSources: "Qloo Taste AI · 11-agent reasoning",
    language: { en: "Vietnamese · English", vi: "Tiếng Việt · Tiếng Anh" },
    partners: "HCMC · Hanoi · Da Nang",
  },
  {
    id: "thailand",
    name: { en: "Thailand", vi: "Thái Lan" },
    live: false,
    dataSources: "Qloo Taste AI (planned)",
    language: { en: "Thai · English", vi: "Tiếng Thái · Tiếng Anh" },
    partners: "Bangkok · Chiang Mai · Phuket (in scoping)",
  },
  {
    id: "malaysia",
    name: { en: "Malaysia", vi: "Malaysia" },
    live: false,
    dataSources: "Qloo Taste AI (planned)",
    language: { en: "Bahasa Malaysia · English · Chinese", vi: "Tiếng Mã Lai · Tiếng Anh · Tiếng Hoa" },
    partners: "Kuala Lumpur · Penang · JB (in scoping)",
  },
  {
    id: "indonesia",
    name: { en: "Indonesia", vi: "Indonesia" },
    live: false,
    dataSources: "Qloo Taste AI (planned)",
    language: { en: "Indonesian · English", vi: "Tiếng Indonesia · Tiếng Anh" },
    partners: "Jakarta · Surabaya · Bali (in scoping)",
  },
  {
    id: "philippines",
    name: { en: "Philippines", vi: "Philippines" },
    live: false,
    dataSources: "Qloo Taste AI (planned)",
    language: { en: "Filipino · English", vi: "Tiếng Filipino · Tiếng Anh" },
    partners: "Manila · Cebu · Davao (in scoping)",
  },
];

export const upcomingAgents = [
  {
    id: "supplierMatch",
    name: { en: "Supplier Match", vi: "Kết nối nhà cung cấp" },
    desc: {
      en: "Maps suppliers, distributors and co-packers for launch.",
      vi: "Kết nối nhà cung cấp, nhà phân phối và đồng đóng gói cho ngày ra mắt.",
    },
  },
  {
    id: "legalAnalyst",
    name: { en: "Legal Analyst", vi: "Phân tích pháp lý" },
    desc: {
      en: "Screens licensing, labeling and import rules for the category.",
      vi: "Rà soát giấy phép, ghi nhãn và quy tắc nhập khẩu theo ngành hàng.",
    },
  },
  {
    id: "hiringPlanner",
    name: { en: "Hiring Planner", vi: "Lập kế hoạch tuyển dụng" },
    desc: {
      en: "Profiles the local roles a first store or office needs.",
      vi: "Phác họa các vị trí địa phương mà cửa hàng hoặc văn phòng đầu tiên cần.",
    },
  },
];

export const whitelabelAudiences = [
  {
    id: "agencies",
    name: { en: "Trade agencies", vi: "Cơ quan thương mại" },
    desc: {
      en: "Give your exporters a data-backed first read on Vietnamese consumers — under your agency's brand.",
      vi: "Trao cho nhà xuất khẩu của bạn cái nhìn dữ liệu đầu tiên về người tiêu dùng Việt — dưới thương hiệu cơ quan của bạn.",
    },
  },
  {
    id: "banks",
    name: { en: "Banks", vi: "Ngân hàng" },
    desc: {
      en: "Stress-test the consumer plays your corporate clients are about to fund.",
      vi: "Kiểm tra các kịch bản tiêu dùng mà khách hàng doanh nghiệp của bạn sắp rót vốn.",
    },
  },
  {
    id: "funds",
    name: { en: "Funds", vi: "Quỹ đầu tư" },
    desc: {
      en: "Add measured taste-affinity evidence to consumer-sector due diligence.",
      vi: "Bổ sung bằng chứng hợp gu thực đo vào thẩm định nhóm hàng tiêu dùng.",
    },
  },
];

export const vaultRows = [
  {
    brand: "Lantern Coffee",
    market: "HCMC",
    prediction: "PILOT · 64",
    actual: {
      en: "3 stores open; District 1 flagship profitable by month 5",
      vi: "Mở 3 cửa hàng; flagship Quận 1 có lãi từ tháng thứ 5",
    },
    signal: { en: "Close", vi: "Sát" },
  },
  {
    brand: "Serein Beauty",
    market: "Hanoi",
    prediction: "GO · 81",
    actual: {
      en: "Launched on Shopee; first drop sold out",
      vi: "Ra mắt trên Shopee; đợt hàng đầu bán hết",
    },
    signal: { en: "Underestimated", vi: "Đánh giá thấp" },
  },
  {
    brand: "Northline Apparel",
    market: "Da Nang",
    prediction: "NO-GO · 38",
    actual: {
      en: "Entry deferred after retail partner talks stalled",
      vi: "Hoãn gia nhập sau khi đàm phán đối tác bán lẻ bế tắc",
    },
    signal: { en: "Close", vi: "Sát" },
  },
];
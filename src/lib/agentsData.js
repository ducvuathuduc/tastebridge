export const agents = [
  {
    id: "brandProfiler",
    name: { en: "Brand Profiler", vi: "Hồ sơ thương hiệu" },
    desc: {
      en: "Decodes your brand's positioning, price tier and cultural signals.",
      vi: "Giải mã định vị, phân khúc giá và tín hiệu văn hóa của thương hiệu.",
    },
  },
  {
    id: "audienceMapper",
    name: { en: "Audience Mapper", vi: "Định vị khách hàng" },
    desc: {
      en: "Identifies the Vietnamese segments most likely to engage with you.",
      vi: "Xác định các nhóm khách hàng Việt có khả năng quan tâm cao nhất.",
    },
  },
  {
    id: "cityScout",
    name: { en: "City Scout", vi: "Trinh sát thành phố" },
    desc: {
      en: "Benchmarks your target city against the category landscape.",
      vi: "So sánh thành phố mục tiêu với bức tranh ngành hàng.",
    },
  },
  {
    id: "tasteAffinity",
    name: { en: "Taste Affinity", vi: "Đo độ hợp gu" },
    desc: {
      en: "Scores cultural affinity using Qloo Taste AI insights.",
      vi: "Chấm điểm độ hợp gu văn hóa bằng Qloo Taste AI.",
    },
  },
  {
    id: "competitorScan",
    name: { en: "Competitor Scan", vi: "Quét đối thủ" },
    desc: {
      en: "Maps the direct and adjacent players already in-market.",
      vi: "Bản đồ hóa các đối thủ trực tiếp và lân cận trên thị trường.",
    },
  },
  {
    id: "culturalFit",
    name: { en: "Cultural Fit", vi: "Độ phù hợp văn hóa" },
    desc: {
      en: "Checks your brand against local norms and sensitivities.",
      vi: "Đối chiếu thương hiệu với chuẩn mực và độ nhạy văn hóa địa phương.",
    },
  },
  {
    id: "priceSensitivity",
    name: { en: "Price Sensitivity", vi: "Độ nhạy giá" },
    desc: {
      en: "Estimates willingness to pay and pricing headroom.",
      vi: "Ước lượng mức sẵn lòng chi trả và dư địa định giá.",
    },
  },
  {
    id: "channelPlanner",
    name: { en: "Channel Planner", vi: "Lập kế hoạch kênh" },
    desc: {
      en: "Recommends launch channels — e-commerce, retail, social.",
      vi: "Gợi ý kênh ra mắt: thương mại điện tử, bán lẻ, mạng xã hội.",
    },
  },
  {
    id: "riskAnalyst",
    name: { en: "Risk Analyst", vi: "Phân tích rủi ro" },
    desc: {
      en: "Flags regulatory, reputational and market-entry risks.",
      vi: "Cảnh báo rủi ro pháp lý, danh tiếng và gia nhập thị trường.",
    },
  },
  {
    id: "localizationWriter",
    name: { en: "Localization Writer", vi: "Chấp bút bản địa hóa" },
    desc: {
      en: "Drafts positioning lines that land in Vietnamese.",
      vi: "Viết các câu định vị chạm được trái tim người Việt.",
    },
  },
  {
    id: "verdictSynthesizer",
    name: { en: "Verdict Synthesizer", vi: "Tổng hợp kết luận" },
    desc: {
      en: "Weighs every agent's output into a GO, PILOT or NO-GO call.",
      vi: "Cân nhắc kết quả của mọi agent thành kết luận GO, PILOT hoặc NO-GO.",
    },
  },
];

export const agentById = Object.fromEntries(agents.map((a) => [a.id, a]));
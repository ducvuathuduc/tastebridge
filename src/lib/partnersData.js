export const demoPartners = [
  {
    id: "mechan",
    name: "Mechan Coffee Group",
    type: "operator",
    typeLabel: { en: "Operator", vi: "Vận hành" },
    categories: "Coffee & Tea · F&B",
    cities: "HCMC · Hanoi",
    stores: 42,
    note: {
      en: "Runs multi-brand premium café chains; actively expanding in District 1 and Thao Dien.",
      vi: "Vận hành chuỗi cà phê cao cấp đa thương hiệu; đang mở rộng tại Quận 1 và Thảo Điền.",
    },
  },
  {
    id: "saigonRetail",
    name: "Saigon Retail Partners",
    type: "operator",
    typeLabel: { en: "Operator", vi: "Vận hành" },
    categories: "Fashion · Beauty",
    cities: "HCMC",
    stores: 18,
    note: {
      en: "Anchor-tenant relationships in every premium mall in the city.",
      vi: "Quan hệ trụ đỡ trong mọi trung tâm thương mại cao cấp của thành phố.",
    },
  },
  {
    id: "hanoiFb",
    name: "Hanoi F&B Holdings",
    type: "operator",
    typeLabel: { en: "Operator", vi: "Vận hành" },
    categories: "Food & Beverage",
    cities: "Hanoi",
    stores: 27,
    note: {
      en: "Family-dining specialist with a distribution arm in the north.",
      vi: "Chuyên gia ẩm thực gia đình kèm đầu mối phân phối tại miền Bắc.",
    },
  },
  {
    id: "vinaFranchise",
    name: "Vina Franchise Group",
    type: "franchisee",
    typeLabel: { en: "Franchisee", vi: "Nhượng quyền" },
    categories: "F&B · Wellness",
    cities: "Da Nang · Hanoi",
    stores: 12,
    note: {
      en: "Signs master-franchise rights for mid-size international brands.",
      vi: "Ký quyền nhượng thương hiệu chính cho các thương hiệu quốc tế vừa.",
    },
  },
  {
    id: "centralCoast",
    name: "Central Coast Operators",
    type: "operator",
    typeLabel: { en: "Operator", vi: "Vận hành" },
    categories: "Home & Living",
    cities: "Da Nang",
    stores: 6,
    note: {
      en: "Boutique retail operator focused on tourism-district storefronts.",
      vi: "Bên vận hành bán lẻ cao cấp tập trung mặt phố khu du lịch.",
    },
  },
  {
    id: "rosewood",
    name: "Rosewood F&B Collective",
    type: "franchisee",
    typeLabel: { en: "Franchisee", vi: "Nhượng quyền" },
    categories: "Coffee & Tea",
    cities: "HCMC · Da Nang",
    stores: 9,
    note: {
      en: "Founder-led collective opening two brands a year.",
      vi: "Tập hợp sáng lập mở hai thương hiệu mỗi năm.",
    },
  },
];

export const demoMatches = [
  {
    name: "Mechan Coffee Group",
    role: { en: "Operator", vi: "Vận hành" },
    fit: 84,
    why: {
      en: "Runs premium coffee formats with a District 1 flagship pedigree.",
      vi: "Vận hành mô hình cà phê cao cấp với kinh nghiệm flagship Quận 1.",
    },
  },
  {
    name: "Shopee",
    role: { en: "E-commerce launchpad", vi: "Bệ phóng thương mại điện tử" },
    fit: 79,
    why: {
      en: "Fastest route to urban Gen Z trial.",
      vi: "Đường nhanh nhất để Gen Z thành phố dùng thử.",
    },
  },
  {
    name: "Saigon Retail Partners",
    role: { en: "Retail partner", vi: "Đối tác bán lẻ" },
    fit: 71,
    why: {
      en: "Premium mall access for a flagship corner.",
      vi: "Vào trung tâm cao cấp cho góc flagship.",
    },
  },
  {
    name: "Grab",
    role: { en: "Delivery network", vi: "Mạng giao hàng" },
    fit: 66,
    why: {
      en: "Extends reach beyond the first-store radius.",
      vi: "Mở rộng phạm vi vượt bán kính cửa hàng đầu tiên.",
    },
  },
];

export const pipelineStages = [
  { id: "intro", label: { en: "Intro", vi: "Tiếp xúc" } },
  { id: "termsheet", label: { en: "Term sheet", vi: "Bản điều khoản" } },
  { id: "signed", label: { en: "Signed", vi: "Đã ký" } },
];

export const demoDeals = [
  { id: "d1", partner: "Mechan Coffee Group", stage: "intro" },
  { id: "d2", partner: "Vina Franchise Group", stage: "termsheet" },
  { id: "d3", partner: "Saigon Retail Partners", stage: "signed" },
];
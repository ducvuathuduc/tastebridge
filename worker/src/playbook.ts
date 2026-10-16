// Auto-generated Vietnam market-entry playbook (guidance, not legal advice).
// Each step is assigned a roadmap phase and an owning department. Due dates are offsets
// in weeks from project creation so every project gets a dated plan.

import { CITY_NAMES } from './catalog';

export const PHASES = ['discover', 'validate', 'setup', 'launch', 'scale'] as const;
export type Phase = (typeof PHASES)[number];

interface Step {
  phase: Phase;
  department: string;
  week: number;
  title: string;
  title_vi: string;
  detail: string;
  detail_vi: string;
  authority?: string;
  foodOnly?: boolean;
}

const STEPS: Step[] = [
  // Discover
  { phase: 'discover', department: 'strategy', week: 1, title: 'Run the TasteBridge market-entry analysis', title_vi: 'Chạy phân tích gia nhập thị trường TasteBridge', detail: 'GO / PILOT / NO-GO verdict, Opportunity Index and district heat map from Qloo taste data.', detail_vi: 'Kết luận GO / PILOT / NO-GO, Chỉ số cơ hội và bản đồ nhiệt quận từ dữ liệu Qloo.' },
  { phase: 'discover', department: 'legal', week: 2, title: 'Trademark clearance search', title_vi: 'Tra cứu khả năng bảo hộ nhãn hiệu', detail: 'Search existing marks in the IP Vietnam online database before committing to the name in Vietnam.', detail_vi: 'Tra cứu nhãn hiệu trên cơ sở dữ liệu trực tuyến của Cục Sở hữu trí tuệ trước khi chốt tên tại Việt Nam.', authority: 'IP Vietnam (Cục Sở hữu trí tuệ)' },
  { phase: 'discover', department: 'strategy', week: 3, title: 'Choose entry model', title_vi: 'Chọn mô hình gia nhập', detail: 'Own subsidiary (FDI), master franchise, JV or distributor. A franchisor based abroad must register franchising with the Ministry of Industry and Trade.', detail_vi: 'Công ty con (FDI), nhượng quyền chính, liên doanh hay nhà phân phối. Bên nhượng quyền ở nước ngoài phải đăng ký hoạt động nhượng quyền với Bộ Công Thương.', authority: 'Ministry of Industry and Trade (Bộ Công Thương)' },
  // Validate
  { phase: 'validate', department: 'legal', week: 4, title: 'File trademark application at IP Vietnam', title_vi: 'Nộp đơn đăng ký nhãn hiệu tại Cục SHTT', detail: 'File early — Vietnam is first-to-file. Cover the relevant Nice classes (e.g. 30 and 43 for coffee/F&B).', detail_vi: 'Nộp sớm — Việt Nam áp dụng nguyên tắc nộp đơn đầu tiên. Bao phủ các nhóm Nice liên quan (ví dụ 30 và 43 cho cà phê/F&B).', authority: 'IP Vietnam (Cục Sở hữu trí tuệ)' },
  { phase: 'validate', department: 'marketing', week: 6, title: 'Demand test: pop-up or delivery-only pilot', title_vi: 'Kiểm chứng nhu cầu: pop-up hoặc thử nghiệm chỉ giao hàng', detail: 'Test price points and the localised menu with real orders before signing a lease.', detail_vi: 'Thử mức giá và thực đơn bản địa hóa với đơn hàng thật trước khi ký thuê mặt bằng.' },
  { phase: 'validate', department: 'partnerships', week: 7, title: 'Shortlist operators / franchisees', title_vi: 'Lập danh sách ngắn đơn vị vận hành / nhận quyền', detail: 'Use the partner match to open intro conversations and request term sheets.', detail_vi: 'Dùng ghép đối tác để mở trao đổi và đề nghị bản điều khoản.' },
  // Setup
  { phase: 'setup', department: 'legal', week: 9, title: 'Investment & enterprise registration (IRC / ERC)', title_vi: 'Đăng ký đầu tư & doanh nghiệp (IRC / ERC)', detail: 'Foreign-owned entities obtain an Investment Registration Certificate, then an Enterprise Registration Certificate, from the provincial authority.', detail_vi: 'Doanh nghiệp có vốn nước ngoài xin Giấy chứng nhận đăng ký đầu tư, sau đó Giấy chứng nhận đăng ký doanh nghiệp tại cơ quan cấp tỉnh.', authority: 'Provincial Department of Finance (formerly DPI)' },
  { phase: 'setup', department: 'legal', week: 10, title: 'Retail business licence (FDI retail)', title_vi: 'Giấy phép kinh doanh bán lẻ (FDI)', detail: 'Foreign-invested companies that retail goods need a business licence and, where required, an outlet licence per store.', detail_vi: 'Doanh nghiệp FDI bán lẻ hàng hóa cần giấy phép kinh doanh và giấy phép lập cơ sở bán lẻ khi được yêu cầu.', authority: 'Provincial Department of Industry and Trade' },
  { phase: 'setup', department: 'real_estate', week: 11, title: 'Sign lease for the first site', title_vi: 'Ký hợp đồng thuê mặt bằng đầu tiên', detail: 'Pick from the heat-map shortlist; confirm fire-safety (PCCC) requirements before fit-out.', detail_vi: 'Chọn từ danh sách bản đồ nhiệt; xác nhận yêu cầu PCCC trước khi thi công.' },
  { phase: 'setup', department: 'operations', week: 12, title: 'Import permits, product declarations & Vietnamese labels', title_vi: 'Giấy phép nhập khẩu, tự công bố sản phẩm & nhãn phụ tiếng Việt', detail: 'Product self-declaration/registration for imported food items, customs classification (HS codes) and Vietnamese sub-labels.', detail_vi: 'Tự công bố/đăng ký bản công bố sản phẩm nhập khẩu, áp mã HS và dán nhãn phụ tiếng Việt.', authority: 'Customs / Ministry of Health / MOIT (by product)' },
  { phase: 'setup', department: 'legal', week: 13, title: 'Food safety eligibility certificate', title_vi: 'Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm', detail: 'Required for F&B premises before trading.', detail_vi: 'Bắt buộc với cơ sở F&B trước khi kinh doanh.', authority: 'Provincial food-safety authority (e.g. HCMC Food Safety Management Board)', foodOnly: true },
  // Launch
  { phase: 'launch', department: 'operations', week: 16, title: 'Soft opening', title_vi: 'Khai trương thử', detail: 'Two-week soft opening to tune operations, service speed and menu.', detail_vi: 'Khai trương thử hai tuần để tinh chỉnh vận hành, tốc độ phục vụ và thực đơn.' },
  { phase: 'launch', department: 'marketing', week: 16, title: 'KOL & TikTok seeding', title_vi: 'Seeding KOL & TikTok', detail: 'Micro-KOL tastings and TikTok content around the opening; track codes per creator.', detail_vi: 'Mời micro-KOL trải nghiệm và làm nội dung TikTok quanh khai trương; theo dõi mã riêng cho từng creator.' },
  { phase: 'launch', department: 'marketing', week: 17, title: 'Go live on GrabFood, ShopeeFood & Zalo OA', title_vi: 'Lên GrabFood, ShopeeFood & Zalo OA', detail: 'Delivery apps for reach beyond the first-store radius; Zalo Official Account for CRM.', detail_vi: 'Ứng dụng giao hàng để mở rộng ngoài bán kính cửa hàng; Zalo OA để chăm sóc khách hàng.' },
  // Scale
  { phase: 'scale', department: 'finance', week: 26, title: 'Six-month KPI review', title_vi: 'Đánh giá KPI sau sáu tháng', detail: 'Compare revenue, orders and unit economics with plan before committing further capital.', detail_vi: 'So sánh doanh thu, đơn hàng và hiệu quả đơn vị với kế hoạch trước khi rót thêm vốn.' },
  { phase: 'scale', department: 'strategy', week: 30, title: 'Second city', title_vi: 'Thành phố thứ hai', detail: 'Re-run the analysis for the next city and reuse the playbook.', detail_vi: 'Chạy lại phân tích cho thành phố tiếp theo và dùng lại playbook.' }
];

export function buildPlaybook(city: string, category: string, createdAt = new Date()) {
  const isFood = category === 'food_beverage' || category === 'coffee_tea';
  const otherCity = Object.keys(CITY_NAMES).find((c) => c !== city) || 'hanoi';
  return STEPS.filter((s) => isFood || !s.foodOnly).map((s, i) => {
    const due = new Date(createdAt.getTime() + s.week * 7 * 86400000).toISOString().slice(0, 10);
    const second = s.title === 'Second city';
    return {
      ...s,
      title: second ? `Second city: ${CITY_NAMES[otherCity]}` : s.title,
      title_vi: second ? `Thành phố thứ hai: ${CITY_NAMES[otherCity]}` : s.title_vi,
      due_date: due,
      sort: i
    };
  });
}

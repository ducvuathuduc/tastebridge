"use client";
import { motion } from "framer-motion";
import { Store, Building2, Landmark, Wrench, Flag, Users, RefreshCcw, Globe2, Swords, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Card, Chip } from "@/components/ui";

type L = { en: string; vi: string };
const STAKEHOLDERS: { icon: any; name: L; gives: L; gets: L }[] = [
  { icon: Store, name: { en: "Foreign F&B brands", vi: "Thương hiệu F&B nước ngoài" }, gives: { en: "Subscription, memo fees, success fees", vi: "Phí thuê bao, phí bản ghi nhớ, phí thành công" }, gets: { en: "Go/no-go verdicts, A–Z launch, vetted partners", vi: "Phán quyết đầu tư, ra mắt A–Z, đối tác đã thẩm định" } },
  { icon: Building2, name: { en: "Local operators & master franchisees", vi: "Nhà vận hành & đối tác nhượng quyền" }, gives: { en: "The concepts they want to run (demand posts)", vi: "Các mô hình họ muốn vận hành (đăng nhu cầu)" }, gets: { en: "Qualified brand deal flow", vi: "Nguồn thương hiệu phù hợp" } },
  { icon: Landmark, name: { en: "Investors", vi: "Nhà đầu tư" }, gives: { en: "Capital for pilots and roll-outs", vi: "Vốn cho thí điểm và mở rộng" }, gets: { en: "Evidence-backed memos, deal access", vi: "Bản ghi nhớ có bằng chứng, tiếp cận thương vụ" } },
  { icon: Wrench, name: { en: "Service partners", vi: "Đối tác dịch vụ" }, gives: { en: "Site brokerage, logistics, legal, agencies, KOLs", vi: "Mặt bằng, logistics, pháp lý, agency, KOL" }, gets: { en: "Matched projects (we take a rate)", vi: "Dự án được ghép (chúng tôi nhận phí)" } },
  { icon: Flag, name: { en: "Trade-promotion agencies", vi: "Cơ quan xúc tiến thương mại" }, gives: { en: "Programs, delegations, co-funding (e.g. VIETRADE, JETRO, KOTRA)", vi: "Chương trình, đoàn xúc tiến, đồng tài trợ (VIETRADE, JETRO, KOTRA)" }, gets: { en: "White-label market scans for their members", vi: "Báo cáo thị trường white-label cho hội viên" } },
  { icon: Users, name: { en: "Target-market consumers", vi: "Người tiêu dùng tại thị trường đích" }, gives: { en: "Pre-orders and feedback in Demand Validation", vi: "Đặt trước và phản hồi khi kiểm chứng nhu cầu" }, gets: { en: "Brands they actually want, adapted to local taste", vi: "Thương hiệu họ thật sự muốn, hợp khẩu vị địa phương" } },
];
const LADDER: { name: L; what: L; price: L }[] = [
  { name: { en: "Taste-Fit Scan", vi: "Taste-Fit Scan" }, what: { en: "Verdict + score per city", vi: "Phán quyết + điểm từng thành phố" }, price: { en: "Free", vi: "Miễn phí" } },
  { name: { en: "Investment Memo", vi: "Bản ghi nhớ đầu tư" }, what: { en: "Committee memo, evidence ledger, launch kit", vi: "Bản ghi nhớ hội đồng, sổ bằng chứng, bộ ra mắt" }, price: { en: "$490 / market (proposed)", vi: "$490 / thị trường (đề xuất)" } },
  { name: { en: "Demand Validation", vi: "Kiểm chứng nhu cầu" }, what: { en: "Localized pre-order page + ads to the taste-matched audience", vi: "Trang đặt trước + quảng cáo bản địa tới đúng tệp khẩu vị" }, price: { en: "$1,500 + ad spend (proposed)", vi: "$1.500 + chi phí quảng cáo (đề xuất)" } },
  { name: { en: "Launch OS", vi: "Launch OS" }, what: { en: "A–Z rollout run through the partner marketplace", vi: "Triển khai A–Z qua sàn đối tác" }, price: { en: "$2,000 / month + 8–12% take rate (proposed)", vi: "$2.000 / tháng + 8–12% phí sàn (đề xuất)" } },
  { name: { en: "Franchise & Capital Match", vi: "Ghép nhượng quyền & vốn" }, what: { en: "Introductions to operators and investors", vi: "Kết nối nhà vận hành và nhà đầu tư" }, price: { en: "3–5% success fee (proposed)", vi: "Phí thành công 3–5% (đề xuất)" } },
  { name: { en: "Bridge (revenue share)", vi: "Bridge (chia doanh thu)" }, what: { en: "We win only if you win", vi: "Chúng tôi chỉ thắng khi bạn thắng" }, price: { en: "1–2% of outlet revenue, years 1–3 (proposed)", vi: "1–2% doanh thu cửa hàng, năm 1–3 (đề xuất)" } },
  { name: { en: "Taste Monitoring", vi: "Giám sát khẩu vị" }, what: { en: "Monthly affinity, heat and competitor drift", vi: "Theo dõi độ hợp, nhiệt và đối thủ hằng tháng" }, price: { en: "$199 / month (proposed)", vi: "$199 / tháng (đề xuất)" } },
  { name: { en: "Insights API", vi: "Insights API" }, what: { en: "Aggregated taste-fit data for malls, landlords, exporters, agencies", vi: "Dữ liệu taste-fit tổng hợp cho TTTM, chủ mặt bằng, nhà xuất khẩu, agency" }, price: { en: "Enterprise (proposed)", vi: "Doanh nghiệp (đề xuất)" } },
];
const COMPETITORS: { name: string; what: L }[] = [
  { name: "B&Company", what: { en: "Japanese research firm doing Vietnam market studies for foreign F&B since 2008 — manual, weeks per report.", vi: "Công ty nghiên cứu Nhật làm khảo sát thị trường Việt Nam cho F&B nước ngoài từ 2008 — thủ công, mất nhiều tuần." } },
  { name: "VF Franchise Consulting", what: { en: "HCMC master-franchise advisory — relationship-driven, no taste data layer.", vi: "Tư vấn nhượng quyền tại TP.HCM — dựa vào quan hệ, không có lớp dữ liệu khẩu vị." } },
  { name: "Franchise law firms", what: { en: "Handle MOIT franchise registration — legal only, no go/no-go.", vi: "Lo đăng ký nhượng quyền với Bộ Công Thương — chỉ pháp lý." } },
  { name: "Tastewise · SiteZeus · Placer.ai · Borne", what: { en: "Global AI tools, US-data-centric, no Vietnam depth.", vi: "Công cụ AI toàn cầu, dữ liệu tập trung Mỹ, không sâu về Việt Nam." } },
];

export default function Business() {
  const { lang } = useI18n();
  const vi = lang === "vi";
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-saffron-600">{vi ? "Mô hình kinh doanh & hệ sinh thái" : "Business model & ecosystem"}</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-5xl">{vi ? "Quyết trong một cú nhấp. Phần còn lại chúng tôi lo A–Z." : "Decide in one click. We run the rest A–Z."}</h1>
        <p className="mt-3 max-w-3xl text-ink-600">{vi ? "Sàn 6 bên kết nối thương hiệu F&B nước ngoài muốn vào Việt Nam với nhà vận hành, nhà đầu tư và đối tác dịch vụ địa phương — dẫn dắt bởi nhu cầu và dữ liệu khẩu vị Qloo." : "A six-sided marketplace connecting foreign F&B brands that want Vietnam with local operators, investors and service partners — demand-led and grounded in Qloo taste data."}</p>
      </header>

      <section>
        <h2 className="font-display text-2xl font-semibold">{vi ? "Sáu bên trong hệ sinh thái" : "Six sides of the marketplace"}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {STAKEHOLDERS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
              <Card className="h-full">
                <s.icon className="h-5 w-5 text-saffron-600" />
                <p className="mt-2 font-semibold">{s.name[lang]}</p>
                <p className="mt-2 text-sm text-ink-600"><b className="text-ink-800">{vi ? "Đóng góp" : "Gives"}:</b> {s.gives[lang]}</p>
                <p className="mt-1 text-sm text-ink-600"><b className="text-ink-800">{vi ? "Nhận" : "Gets"}:</b> {s.gets[lang]}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold">{vi ? "Thang sản phẩm" : "Product ladder"}</h2>
          <Chip className="bg-saffron-100">{vi ? "Giá đều là đề xuất, chưa áp dụng" : "All pricing is proposed, not live"}</Chip>
        </div>
        <ol className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {LADDER.map((p, i) => (
            <li key={i} className="relative rounded-[var(--radius-card)] border border-line bg-white p-5">
              <span className="font-mono text-xs text-saffron-600">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-1 font-semibold">{p.name[lang]}</p>
              <p className="mt-1 text-sm text-ink-600">{p.what[lang]}</p>
              <p className="mt-3 font-mono text-xs text-ink-900">{p.price[lang]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <RefreshCcw className="h-5 w-5 text-saffron-600" />
          <h2 className="mt-2 font-display text-xl font-semibold">{vi ? "Bánh đà dữ liệu" : "Data flywheel"}</h2>
          <p className="mt-2 text-sm text-ink-600">{vi ? "Mỗi lần ra mắt thật (doanh thu, đặt trước, đóng cửa) gắn nhãn cho dự đoán Taste-Fit trước đó. Nhiều nhãn hơn → mô hình chính xác hơn → nhiều thương hiệu tin dùng hơn → nhiều nhãn hơn. Dữ liệu kết quả này là hào phòng thủ mà công cụ dùng dữ liệu Mỹ không có." : "Every real launch outcome (sales, pre-orders, closures) labels the Taste-Fit prediction made before it. More labels → better calibrated model → more brands trust it → more labels. These outcome labels are the moat US-data tools don't have."}</p>
          <p className="mt-3 text-sm text-ink-600"><b>{vi ? "Hiệu ứng mạng" : "Network effect"}:</b> {vi ? "nhiều nhà vận hành → nhiều thương hiệu → nhiều thương vụ → mô hình tốt hơn." : "more operators → more brands → more deals → better model."}</p>
        </Card>
        <Card>
          <Globe2 className="h-5 w-5 text-saffron-600" />
          <h2 className="mt-2 font-display text-xl font-semibold">{vi ? "Chiến lược thị trường" : "Go-to-market"}</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink-600">
            <li>{vi ? "Thương hiệu F&B nước ngoài muốn vào Việt Nam (TP.HCM, Hà Nội, Đà Nẵng) — khách hàng chính." : "Foreign F&B brands entering Vietnam (HCMC, Hanoi, Da Nang) — primary customer."}</li>
            <li>{vi ? "Chiều ngược: thương hiệu Việt ra Nhật, Hàn, Úc." : "Reverse: Vietnamese brands to Japan, Korea, Australia."}</li>
            <li>{vi ? "Market Pack mới: Thái Lan, Indonesia, Philippines → ĐNÁ → châu Á." : "New Market Packs: Thailand, Indonesia, Philippines → SEA → Asia."}</li>
            <li>{vi ? "Ngành dọc mới: làm đẹp, bán lẻ, thời trang; API & white-label." : "New verticals: beauty, retail, fashion; APIs & white-label."}</li>
          </ol>
        </Card>
      </section>

      <section>
        <div className="flex items-center gap-2"><Swords className="h-5 w-5 text-saffron-600" /><h2 className="font-display text-2xl font-semibold">{vi ? "Cạnh tranh & lợi thế" : "Competition & our edge"}</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {COMPETITORS.map((c) => <Card key={c.name}><p className="font-semibold">{c.name}</p><p className="mt-1 text-sm text-ink-600">{c.what[lang]}</p></Card>)}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            vi ? "Lớp khẩu vị ưu tiên Việt Nam trên nền Qloo" : "Vietnam-first taste layer on top of Qloo",
            vi ? "Ghép hai chiều theo nhu cầu: nhà vận hành đăng mô hình họ muốn" : "Demand-led matching: operators post the concepts they want",
            vi ? "Chỉ số Cơ hội F&B Việt Nam công khai" : "Public Vietnam F&B Opportunity Index",
            vi ? "Định giá theo kết quả" : "Outcome-based pricing",
          ].map((x, i) => <div key={i} className="rounded-2xl bg-ink-950 p-4 text-sm text-paper"><TrendingUp className="mb-2 h-4 w-4 text-saffron-500" />{x}</div>)}
        </div>
      </section>
    </div>
  );
}

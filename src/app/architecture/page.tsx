"use client";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui";
import { REPO_URL } from "@/components/Nav";

const Box = ({ x, y, w, h, title, sub, fill = "#ffffff", stroke = "#e6dfd0", dark = false }: { x: number; y: number; w: number; h: number; title: string; sub?: string; fill?: string; stroke?: string; dark?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="14" fill={fill} stroke={stroke} />
    <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 5)} textAnchor="middle" fontSize="14" fontWeight="600" fill={dark ? "#fbf8f2" : "#111a2c"}>{title}</text>
    {sub && <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fontSize="11" fill={dark ? "#f5cf8e" : "#5b6b86"}>{sub}</text>}
  </g>
);
const Arrow = ({ d, label, lx, ly }: { d: string; label?: string; lx?: number; ly?: number }) => (
  <g>
    <path d={d} fill="none" stroke="#c9811b" strokeWidth="1.6" markerEnd="url(#arr)" />
    {label && <text x={lx} y={ly} fontSize="10.5" fill="#5b6b86" textAnchor="middle">{label}</text>}
  </g>
);

export default function Architecture() {
  const { lang } = useI18n();
  const vi = lang === "vi";
  const agents = ["Profiler", "Scout", "Analog", "Culture", "Localize", "Bull", "Bear", "Chair", "Launch", "Validate", "Partners"];
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-saffron-600">{vi ? "Kiến trúc hệ thống" : "System architecture"}</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-5xl">{vi ? "Tác tử, Qloo, LLM và sàn đối tác" : "Agents, Qloo, LLMs and the partner marketplace"}</h1>
      </header>
      <Card className="overflow-x-auto">
        <svg viewBox="0 0 1100 620" className="min-w-[900px]" role="img" aria-label="TasteBridge architecture diagram">
          <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#c9811b" /></marker></defs>
          <Box x={30} y={40} w={200} h={70} title={vi ? "Thương hiệu / Nhà đầu tư" : "Brand / Investor"} sub="Next.js UI · EN / VI" />
          <Box x={30} y={150} w={200} h={70} title={vi ? "Nhà vận hành & đối tác" : "Operators & partners"} sub={vi ? "đăng nhu cầu (lộ trình)" : "demand posts (roadmap)"} />
          <Arrow d="M230,75 L330,95" label="POST /api/run" lx={282} ly={72} />

          <rect x={330} y={30} width={460} height={420} rx="20" fill="#fbf8f2" stroke="#e6dfd0" />
          <text x={350} y={58} fontSize="13" fontWeight="700" fill="#111a2c">{vi ? "Bộ điều phối (NDJSON stream)" : "Orchestrator (NDJSON event stream)"}</text>
          {agents.map((a, i) => {
            const col = i % 4, row = Math.floor(i / 4);
            return <Box key={a} x={350 + col * 108} y={75 + row * 62} w={98} h={48} title={a} fill={i >= 5 && i <= 7 ? "#fdf1dc" : i >= 8 ? "#e3f4ec" : "#ffffff"} />;
          })}
          <Box x={350} y={275} w={200} h={64} title={vi ? "Mô hình Taste-Fit" : "Taste-Fit model"} sub={vi ? "tất định · không LLM" : "deterministic · no LLM"} fill="#111a2c" stroke="#111a2c" dark />
          <Box x={570} y={275} w={200} h={64} title={vi ? "Sổ bằng chứng" : "Evidence ledger"} sub={vi ? "mọi số liệu → truy vấn Qloo" : "every figure → Qloo request"} />
          <Box x={350} y={360} w={200} h={64} title="Agent registry" sub={vi ? "thêm tác tử mới = 1 mục" : "new agent = one entry"} />
          <Box x={570} y={360} w={200} h={64} title="Market Packs" sub="vn · global · (th, id, ph…)" />

          <Box x={870} y={40} w={200} h={80} title="Qloo Insights API" sub="search · tags · insights · heatmap" fill="#111a2c" stroke="#111a2c" dark />
          <Box x={870} y={160} w={200} h={70} title="LLM providers" sub="Groq gpt-oss → Gemini fallback" />
          <Box x={870} y={270} w={200} h={70} title={vi ? "Kho kết quả (event-sourced)" : "Outcome store (event-sourced)"} sub={vi ? "lộ trình · học từ kết quả" : "roadmap · learning loop"} />
          <Box x={870} y={380} w={200} h={70} title={vi ? "Sàn đối tác" : "Partner marketplace"} sub={vi ? "mặt bằng · pháp lý · KOL" : "sites · legal · KOLs"} />
          <Arrow d="M790,110 L870,85" label={vi ? "gọi công cụ" : "tool calls"} lx={828} ly={88} />
          <Arrow d="M790,190 L870,195" label="function calling" lx={830} ly={182} />
          <Arrow d="M790,320 L870,305" />
          <Arrow d="M790,410 L870,415" />
          <Arrow d="M970,340 L970,380" />
          <Arrow d="M870,300 C 700,520 300,560 130,230" label={vi ? "nhãn kết quả hiệu chỉnh mô hình" : "launch outcomes recalibrate the model"} lx={520} ly={540} />

          <Box x={330} y={480} w={460} h={60} title={vi ? "Đầu ra: phán quyết · bản đồ nhiệt · kế hoạch A–Z · memo PDF" : "Outputs: verdicts · heatmap · A–Z plan · PDF memo"} fill="#e3f4ec" stroke="#13795b" />
          <Arrow d="M560,450 L560,480" />
          <Arrow d="M330,510 L230,110" />
        </svg>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { h: vi ? "Gọi công cụ gốc" : "Native tool calling", p: vi ? "Mỗi tác tử là vòng lặp LLM với tập công cụ Qloo riêng (JSON schema). Nếu tác tử bỏ sót thành phố, bộ điều phối chạy công cụ trực tiếp và ghi nhãn 'auto'." : "Each agent is an LLM loop with its own Qloo tool set (JSON-schema functions). If an agent skips a city, the orchestrator runs the tool directly and labels it 'auto'." },
          { h: vi ? "Không bịa số" : "No invented numbers", p: vi ? "Điểm và dải ngân sách tính bằng mã tất định từ phản hồi Qloo; LLM chỉ lập luận và viết. Dải ngân sách là tỷ lệ trên ngân sách do người dùng nhập." : "Scores and budget bands are computed in code from Qloo responses; LLMs only reason and write. Budget bands are shares of the user's own budget." },
          { h: vi ? "Mở rộng không fork" : "Scale without forks", p: vi ? "Thị trường mới = Market Pack (thành phố, ngôn ngữ, tiền tệ, vai trò đối tác, ghi chú pháp lý). Tác tử mới = một mục trong registry. Lõi API đa khách thuê." : "New market = a Market Pack (cities, locale, currency, partner roles, regulatory notes). New agent = one registry entry. API-first, multi-tenant core." },
        ].map((x) => <Card key={x.h}><p className="font-semibold">{x.h}</p><p className="mt-2 text-sm text-ink-600">{x.p}</p></Card>)}
      </div>
      <p className="text-sm text-ink-500">{vi ? "Mã nguồn MIT:" : "MIT source:"} <a className="font-medium text-ink-900 underline" href={REPO_URL} target="_blank" rel="noreferrer">{REPO_URL}</a></p>
    </div>
  );
}

/**
 * Demo presets. Inbound brands were checked on 2026-10-14: no Vietnam venues in Qloo search,
 * and public sources list no Vietnam stores (see README → Presets for the sources).
 */
export interface Preset { brand: string; homeCity: string; items: string; pack: "vn" | "global"; cities: string[]; note: { en: string; vi: string } }

export const PRESETS: Preset[] = [
  { brand: "Blue Bottle Coffee", homeCity: "San Francisco", items: "New Orleans iced coffee, single-origin pour-over", pack: "vn", cities: ["hcmc", "hanoi", "danang"], note: { en: "US specialty coffee · in Japan, Korea, China, Singapore, Thailand — not Vietnam", vi: "Cà phê đặc sản Mỹ · có ở Nhật, Hàn, Trung Quốc, Singapore, Thái Lan — chưa có ở Việt Nam" } },
  { brand: "Ichiran", homeCity: "Fukuoka", items: "Tonkotsu ramen, solo dining booths", pack: "vn", cities: ["hcmc", "hanoi", "danang"], note: { en: "Japanese ramen · Japan, Hong Kong, Taiwan, US only", vi: "Ramen Nhật · chỉ có ở Nhật, Hồng Kông, Đài Loan, Mỹ" } },
  { brand: "Five Guys", homeCity: "Arlington, Virginia", items: "Burgers, hand-cut fries, milkshakes", pack: "vn", cities: ["hcmc", "hanoi", "danang"], note: { en: "US burgers · 30 countries, none in Vietnam", vi: "Burger Mỹ · 30 quốc gia, chưa có Việt Nam" } },
  { brand: "Tim Hortons", homeCity: "Toronto", items: "Iced Capp, Timbits, double-double coffee", pack: "vn", cities: ["hcmc", "hanoi", "danang"], note: { en: "Canadian coffee & donuts · in Singapore, Malaysia, Thailand — not Vietnam", vi: "Cà phê & donut Canada · có ở Singapore, Malaysia, Thái Lan — chưa có Việt Nam" } },
  { brand: "Phúc Long", homeCity: "Ho Chi Minh City", items: "Lotus tea, Vietnamese coffee, matcha latte", pack: "global", cities: ["tokyo", "seoul", "sydney"], note: { en: "Reverse direction: Vietnamese tea & coffee going abroad", vi: "Chiều ngược: trà & cà phê Việt ra nước ngoài" } },
];

import type { Lang } from "./types";

export function formatMoney(n: number, currency: "USD" | "VND", lang: Lang) {
  const locale = lang === "vi" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}
export function formatNum(n: number, lang: Lang, digits = 0) {
  return new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: digits }).format(n);
}

/**
 * A Market Pack is everything TasteBridge needs to serve a new market without forking code:
 * cities (with the query string Qloo resolves), locale + currency, partner-network roles,
 * and regulatory notes. Adding Thailand or Japan = adding one file to src/lib/markets/packs.
 */
export interface MarketCity {
  id: string;
  /** Exact string sent as filter.location.query to Qloo */
  qlooQuery: string;
  name: { en: string; vi: string };
  /** Coverage tier from our own Qloo coverage audit (see README → Coverage). */
  coverage: "deep" | "medium" | "thin";
  center: [number, number];
}

export interface PartnerRole {
  id: string;
  name: { en: string; vi: string };
  why: { en: string; vi: string };
  criteria: { en: string[]; vi: string[] };
}

export interface MarketPack {
  id: string;
  country: { en: string; vi: string };
  direction: "inbound" | "outbound";
  locale: string;
  currency: { code: string; symbol: string };
  cities: MarketCity[];
  defaultCities: string[];
  partnerRoles: PartnerRole[];
  regulatoryNotes: { en: string[]; vi: string[] };
}

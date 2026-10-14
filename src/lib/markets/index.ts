import { vietnam } from "./packs/vietnam";
import { global } from "./packs/global";
import type { MarketPack } from "./types";

/** Market Pack registry. New market = new pack file + one line here. */
export const MARKET_PACKS: Record<string, MarketPack> = { [vietnam.id]: vietnam, [global.id]: global };
export const DEFAULT_PACK = vietnam.id;

export function getPack(id: string | undefined): MarketPack {
  return MARKET_PACKS[id || DEFAULT_PACK] || MARKET_PACKS[DEFAULT_PACK];
}
export type { MarketPack, MarketCity, PartnerRole } from "./types";

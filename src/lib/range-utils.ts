import type { MarketRange } from '@/lib/types';

/** Returns the range with the highest total volume, or undefined if empty. */
export function getTopVolumeRange(ranges: MarketRange[]): MarketRange | undefined {
  if (ranges.length === 0) return undefined;
  return ranges.reduce((best, r) => (r.totalVolume > best.totalVolume ? r : best), ranges[0]);
}

/** Applies top-volume range overrides to a market's display fields. */
export function applyTopRange<T extends { lowerBound: number; upperBound: number; currentPrice: number; volume24h: number; totalVolume: number; openInterest: number }>(
  market: T,
  ranges: MarketRange[] | undefined,
): T {
  if (!ranges || ranges.length === 0) return market;
  const top = getTopVolumeRange(ranges);
  if (!top) return market;
  return {
    ...market,
    lowerBound: top.lowerBound,
    upperBound: top.upperBound,
    currentPrice: top.currentPrice,
    volume24h: top.volume24h,
    totalVolume: top.totalVolume,
    openInterest: top.openInterest,
  };
}

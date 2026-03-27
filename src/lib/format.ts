/**
 * Shared formatting utilities used across MarketCard, SimilarMarkets, MarketDetail, etc.
 * Extracted to avoid duplication.
 */

/** Format an implied value for display based on unit type */
export function fmtImplied(n: number, unit: string): string {
  if (unit === '$' || unit === '$/oz' || unit === '$/bbl')
    return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(1);
  if (unit === 'pts') return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n.toFixed(2);
}

/** Clamp a number between 0 and 100 */
export function clamp(n: number): number {
  return Math.min(100, Math.max(0, n));
}

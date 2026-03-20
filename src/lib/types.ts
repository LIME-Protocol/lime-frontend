export type MarketStatus = 'active' | 'resolved' | 'settled';

export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  variable: string;
  unit: string;
  lowerBound: number;
  upperBound: number;
  resolutionDate: string;
  settlementSource: string;
  status: MarketStatus;
  currentPrice: number; // 0-1 representing position in L-U range
  volume24h: number;
  totalVolume: number;
  resolvedValue?: number;
  createdAt: string;
}

export interface Position {
  id: string;
  marketId: string;
  market: Market;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
}

export interface Trade {
  id: string;
  marketId: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: string;
}

export function calculatePayoff(value: number, lower: number, upper: number): number {
  if (value <= lower) return 0;
  if (value >= upper) return 1;
  return (value - lower) / (upper - lower);
}

export function impliedValue(price: number, lower: number, upper: number): number {
  return lower + price * (upper - lower);
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatPrice(n: number): string {
  return `${(n * 100).toFixed(1)}¢`;
}

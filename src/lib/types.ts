// ── Market ──
export type MarketStatus = 'active' | 'pending' | 'resolved' | 'settled' | 'invalid';

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
  currentPrice: number;        // 0–1 position in [L, U]
  referenceValue?: number;     // latest observed reference
  volume24h: number;
  totalVolume: number;
  openInterest: number;
  resolvedValue?: number;
  createdAt: string;
  trending?: boolean;
}

// ── Order Book ──
export interface OrderBookLevel {
  price: number;   // 0–1
  size: number;
  total: number;   // cumulative
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
}

// ── Trade ──
export interface Trade {
  id: string;
  marketId: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: string;
}

// ── Position ──
export interface Position {
  id: string;
  marketId: string;
  market: Market;
  side: 'long' | 'short';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
}

// ── Order ──
export type OrderStatus = 'open' | 'filled' | 'partial' | 'cancelled';

export interface Order {
  id: string;
  marketId: string;
  marketTitle: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  price: number;
  quantity: number;
  filled: number;
  status: OrderStatus;
  createdAt: string;
}

// ── Admin Log ──
export type LogAction = 'create' | 'approve' | 'resolve' | 'invalidate' | 'edit';

export interface AdminLog {
  id: string;
  action: LogAction;
  marketId: string;
  marketTitle: string;
  operator: string;
  detail: string;
  timestamp: string;
}

// ── Helpers ──
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

export function formatNumber(n: number, decimals = 1): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

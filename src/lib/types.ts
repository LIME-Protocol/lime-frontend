// ── Payoff Curve Types ──
export type PayoffCurveType = 'linear' | 'sigmoid' | 'step' | 'convex' | 'concave';

export interface PayoffCurve {
  type: PayoffCurveType;
  label: string;
  /** steepness param for sigmoid */
  steepness?: number;
  /** threshold for step function (0-1 within range) */
  stepThreshold?: number;
  /** exponent for convex/concave */
  exponent?: number;
}

// ── Market ──
export type MarketStatus = 'active' | 'pending' | 'preliminary' | 'resolved' | 'settled' | 'invalid';

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
  payoffCurve?: PayoffCurve;
  imageUrl?: string;
  /** @deprecated Use getCategoryEmoji(category) instead */
  emoji?: string;
  /** Number of unique participants (for preliminary → active transition) */
  participantCount?: number;
  /** Minimum participants needed to go active */
  minParticipants?: number;
  /** Submitted by user id/name */
  submittedBy?: string;
}

// ── Market Range Option ──
export interface MarketRange {
  id: string;
  marketId: string;
  label: string;
  lowerBound: number;
  upperBound: number;
  status: 'active' | 'preliminary';
  currentPrice: number;
  volume24h: number;
  totalVolume: number;
  openInterest: number;
  payoffCurve?: PayoffCurve;
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

/** Calculate payoff for a given curve type */
export function calculatePayoff(value: number, lower: number, upper: number, curve?: PayoffCurve): number {
  if (value <= lower) return 0;
  if (value >= upper) return 1;
  const t = (value - lower) / (upper - lower); // normalized 0-1

  if (!curve || curve.type === 'linear') return t;

  if (curve.type === 'sigmoid') {
    const k = curve.steepness ?? 10;
    const raw = 1 / (1 + Math.exp(-k * (t - 0.5)));
    const low = 1 / (1 + Math.exp(-k * (0 - 0.5)));
    const high = 1 / (1 + Math.exp(-k * (1 - 0.5)));
    return (raw - low) / (high - low);
  }

  if (curve.type === 'step') {
    const threshold = curve.stepThreshold ?? 0.5;
    return t >= threshold ? 1 : 0;
  }

  if (curve.type === 'convex') {
    const exp = curve.exponent ?? 2;
    return Math.pow(t, exp);
  }

  if (curve.type === 'concave') {
    const exp = curve.exponent ?? 2;
    return 1 - Math.pow(1 - t, exp);
  }

  return t;
}

/** Sell-side payoff is the complement of buy-side */
export function calculateSellPayoff(value: number, lower: number, upper: number, curve?: PayoffCurve): number {
  return 1 - calculatePayoff(value, lower, upper, curve);
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

export function payoffCurveLabel(curve?: PayoffCurve): string {
  if (!curve || curve.type === 'linear') return 'Linear';
  if (curve.type === 'sigmoid') return 'Sigmoid';
  if (curve.type === 'step') return 'Binary Step';
  if (curve.type === 'convex') return 'Convex';
  if (curve.type === 'concave') return 'Concave';
  return 'Custom';
}

import { Market, Position, Order, Trade, OrderBook, AdminLog } from './types';

// ────────────────────────────────── Markets ──────────────────────────────────

export const markets: Market[] = [
  {
    id: 'm1',
    title: 'Fed Funds Rate — Dec 2025',
    description: 'What will the upper bound of the federal funds target rate be after the December 2025 FOMC meeting?',
    category: 'Rates',
    variable: 'Fed Funds Upper',
    unit: '%',
    lowerBound: 3.0,
    upperBound: 5.5,
    resolutionDate: '2025-12-17',
    settlementSource: 'Federal Reserve — FOMC Statement',
    status: 'active',
    currentPrice: 0.48,
    referenceValue: 4.50,
    volume24h: 412_800,
    totalVolume: 8_340_000,
    openInterest: 1_240_000,
    createdAt: '2025-01-10',
    trending: true,
  },
  {
    id: 'm2',
    title: 'US CPI YoY — June 2025',
    description: 'What will the US Consumer Price Index year-over-year change be for June 2025 as reported by BLS?',
    category: 'Inflation',
    variable: 'CPI YoY',
    unit: '%',
    lowerBound: 1.5,
    upperBound: 5.0,
    resolutionDate: '2025-07-11',
    settlementSource: 'Bureau of Labor Statistics — CPI Report',
    status: 'active',
    currentPrice: 0.42,
    referenceValue: 2.8,
    volume24h: 287_400,
    totalVolume: 5_120_000,
    openInterest: 890_000,
    createdAt: '2025-02-01',
    trending: true,
  },
  {
    id: 'm3',
    title: 'EUR/USD — End of Q1 2026',
    description: 'What will the EUR/USD spot rate be at the close of trading on the last business day of Q1 2026?',
    category: 'FX',
    variable: 'EUR/USD',
    unit: '',
    lowerBound: 0.95,
    upperBound: 1.20,
    resolutionDate: '2026-03-31',
    settlementSource: 'ECB Reference Rate',
    status: 'active',
    currentPrice: 0.56,
    referenceValue: 1.085,
    volume24h: 534_200,
    totalVolume: 9_800_000,
    openInterest: 1_670_000,
    createdAt: '2025-03-01',
    trending: false,
  },
  {
    id: 'm4',
    title: 'US GDP Growth 2025',
    description: 'What will be the annualized real GDP growth rate for the US in 2025 as reported in the advance estimate?',
    category: 'Macro',
    variable: 'Real GDP Growth',
    unit: '%',
    lowerBound: -1.0,
    upperBound: 4.0,
    resolutionDate: '2026-01-30',
    settlementSource: 'Bureau of Economic Analysis — GDP Advance Estimate',
    status: 'active',
    currentPrice: 0.52,
    volume24h: 156_700,
    totalVolume: 3_450_000,
    openInterest: 520_000,
    createdAt: '2025-01-20',
    trending: false,
  },
  {
    id: 'm5',
    title: 'S&P 500 — Year End 2025',
    description: 'What will be the closing value of the S&P 500 Index on the last trading day of 2025?',
    category: 'Equities',
    variable: 'S&P 500',
    unit: 'pts',
    lowerBound: 4_500,
    upperBound: 6_500,
    resolutionDate: '2025-12-31',
    settlementSource: 'S&P Dow Jones Indices — Official Close',
    status: 'active',
    currentPrice: 0.63,
    referenceValue: 5_820,
    volume24h: 678_900,
    totalVolume: 12_400_000,
    openInterest: 2_100_000,
    createdAt: '2025-01-02',
    trending: true,
  },
  {
    id: 'm6',
    title: 'WTI Crude — Sept 2025',
    description: 'What will be the WTI Crude Oil front-month settlement price on September 30, 2025?',
    category: 'Commodities',
    variable: 'WTI Crude',
    unit: '$/bbl',
    lowerBound: 50,
    upperBound: 100,
    resolutionDate: '2025-09-30',
    settlementSource: 'NYMEX — Settlement Price',
    status: 'active',
    currentPrice: 0.44,
    referenceValue: 72.3,
    volume24h: 321_500,
    totalVolume: 6_700_000,
    openInterest: 980_000,
    createdAt: '2025-03-15',
    trending: false,
  },
  {
    id: 'm7',
    title: 'US 10Y Yield — June 2025',
    description: 'What will the 10-year US Treasury yield be at the close of trading on June 30, 2025?',
    category: 'Rates',
    variable: '10Y Yield',
    unit: '%',
    lowerBound: 3.0,
    upperBound: 5.5,
    resolutionDate: '2025-06-30',
    settlementSource: 'US Treasury — Daily Yield Curve',
    status: 'active',
    currentPrice: 0.55,
    referenceValue: 4.35,
    volume24h: 198_300,
    totalVolume: 4_200_000,
    openInterest: 710_000,
    createdAt: '2025-02-15',
    trending: false,
  },
  {
    id: 'm8',
    title: 'US Unemployment — Dec 2024',
    description: 'What was the US unemployment rate for December 2024 as reported by BLS?',
    category: 'Labor',
    variable: 'Unemployment Rate',
    unit: '%',
    lowerBound: 3.0,
    upperBound: 5.5,
    resolutionDate: '2025-01-10',
    settlementSource: 'Bureau of Labor Statistics — Employment Situation',
    status: 'resolved',
    currentPrice: 0.44,
    resolvedValue: 4.1,
    volume24h: 0,
    totalVolume: 3_870_000,
    openInterest: 0,
    createdAt: '2024-10-01',
  },
  {
    id: 'm9',
    title: 'Bitcoin — End of 2024',
    description: 'What was the BTC/USD price at midnight UTC on January 1, 2025 (CoinGecko reference)?',
    category: 'Crypto',
    variable: 'BTC/USD',
    unit: '$',
    lowerBound: 30_000,
    upperBound: 120_000,
    resolutionDate: '2025-01-01',
    settlementSource: 'CoinGecko — BTC/USD Spot',
    status: 'resolved',
    currentPrice: 0.72,
    resolvedValue: 94_500,
    volume24h: 0,
    totalVolume: 14_200_000,
    openInterest: 0,
    createdAt: '2024-06-01',
  },
  {
    id: 'm10',
    title: 'Gold — Dec 2025',
    description: 'What will the LBMA PM Gold Fix be on December 31, 2025?',
    category: 'Commodities',
    variable: 'Gold (XAU/USD)',
    unit: '$/oz',
    lowerBound: 1_800,
    upperBound: 3_200,
    resolutionDate: '2025-12-31',
    settlementSource: 'LBMA — PM Gold Fix',
    status: 'active',
    currentPrice: 0.68,
    referenceValue: 2_640,
    volume24h: 445_000,
    totalVolume: 7_900_000,
    openInterest: 1_350_000,
    createdAt: '2025-01-05',
    trending: true,
  },
];

// ────────────────────────────────── Order Book ──────────────────────────────────

export function generateOrderBook(midPrice: number): OrderBook {
  const bids = Array.from({ length: 8 }, (_, i) => {
    const price = Math.max(0.01, midPrice - (i + 1) * 0.01);
    const size = Math.floor(50 + Math.random() * 200);
    return { price: Number(price.toFixed(3)), size, total: 0 };
  });
  const asks = Array.from({ length: 8 }, (_, i) => {
    const price = Math.min(0.99, midPrice + (i + 1) * 0.01);
    const size = Math.floor(50 + Math.random() * 200);
    return { price: Number(price.toFixed(3)), size, total: 0 };
  });

  let cumBid = 0;
  for (const b of bids) { cumBid += b.size; b.total = cumBid; }
  let cumAsk = 0;
  for (const a of asks) { cumAsk += a.size; a.total = cumAsk; }

  return {
    bids,
    asks,
    spread: Number((asks[0].price - bids[0].price).toFixed(3)),
  };
}

// ────────────────────────────────── Recent Trades ──────────────────────────────────

export function generateTrades(marketId: string, basePrice: number, count = 20): Trade[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `t-${marketId}-${i}`,
    marketId,
    side: Math.random() > 0.5 ? 'buy' as const : 'sell' as const,
    price: Number((basePrice + (Math.random() - 0.5) * 0.04).toFixed(3)),
    quantity: Math.floor(5 + Math.random() * 100),
    timestamp: new Date(now - i * 120_000 - Math.random() * 60_000).toISOString(),
  }));
}

// ────────────────────────────────── Positions ──────────────────────────────────

export const positions: Position[] = [
  {
    id: 'p1',
    marketId: 'm1',
    market: markets[0],
    side: 'long',
    quantity: 150,
    avgPrice: 0.42,
    currentPrice: 0.48,
    pnl: 9.0,
    pnlPercent: 14.3,
    openedAt: '2025-02-10T14:30:00Z',
  },
  {
    id: 'p2',
    marketId: 'm3',
    market: markets[2],
    side: 'long',
    quantity: 200,
    avgPrice: 0.50,
    currentPrice: 0.56,
    pnl: 12.0,
    pnlPercent: 12.0,
    openedAt: '2025-03-05T09:15:00Z',
  },
  {
    id: 'p3',
    marketId: 'm5',
    market: markets[4],
    side: 'short',
    quantity: 75,
    avgPrice: 0.68,
    currentPrice: 0.63,
    pnl: 3.75,
    pnlPercent: 7.4,
    openedAt: '2025-02-20T16:45:00Z',
  },
  {
    id: 'p4',
    marketId: 'm10',
    market: markets[9],
    side: 'long',
    quantity: 100,
    avgPrice: 0.60,
    currentPrice: 0.68,
    pnl: 8.0,
    pnlPercent: 13.3,
    openedAt: '2025-01-15T11:00:00Z',
  },
];

// ────────────────────────────────── Orders ──────────────────────────────────

export const orders: Order[] = [
  { id: 'o1', marketId: 'm1', marketTitle: 'Fed Funds Rate — Dec 2025', side: 'buy', type: 'limit', price: 0.45, quantity: 50, filled: 50, status: 'filled', createdAt: '2025-03-18T10:30:00Z' },
  { id: 'o2', marketId: 'm5', marketTitle: 'S&P 500 — Year End 2025', side: 'sell', type: 'limit', price: 0.65, quantity: 30, filled: 30, status: 'filled', createdAt: '2025-03-17T14:20:00Z' },
  { id: 'o3', marketId: 'm3', marketTitle: 'EUR/USD — End of Q1 2026', side: 'buy', type: 'limit', price: 0.53, quantity: 100, filled: 0, status: 'open', createdAt: '2025-03-19T08:45:00Z' },
  { id: 'o4', marketId: 'm10', marketTitle: 'Gold — Dec 2025', side: 'buy', type: 'market', price: 0.60, quantity: 100, filled: 100, status: 'filled', createdAt: '2025-01-15T11:00:00Z' },
  { id: 'o5', marketId: 'm2', marketTitle: 'US CPI YoY — June 2025', side: 'sell', type: 'limit', price: 0.50, quantity: 40, filled: 20, status: 'partial', createdAt: '2025-03-19T16:10:00Z' },
  { id: 'o6', marketId: 'm6', marketTitle: 'WTI Crude — Sept 2025', side: 'buy', type: 'limit', price: 0.40, quantity: 60, filled: 0, status: 'cancelled', createdAt: '2025-03-16T12:00:00Z' },
];

// ────────────────────────────────── Admin Logs ──────────────────────────────────

export const adminLogs: AdminLog[] = [
  { id: 'l1', action: 'create', marketId: 'm10', marketTitle: 'Gold — Dec 2025', operator: 'admin@rangex.io', detail: 'Market created with range $1,800–$3,200', timestamp: '2025-01-05T09:00:00Z' },
  { id: 'l2', action: 'approve', marketId: 'm10', marketTitle: 'Gold — Dec 2025', operator: 'ops@rangex.io', detail: 'Market approved and opened for trading', timestamp: '2025-01-05T10:30:00Z' },
  { id: 'l3', action: 'create', marketId: 'm1', marketTitle: 'Fed Funds Rate — Dec 2025', operator: 'admin@rangex.io', detail: 'Market created with range 3.0%–5.5%', timestamp: '2025-01-10T08:00:00Z' },
  { id: 'l4', action: 'approve', marketId: 'm1', marketTitle: 'Fed Funds Rate — Dec 2025', operator: 'ops@rangex.io', detail: 'Market approved', timestamp: '2025-01-10T09:15:00Z' },
  { id: 'l5', action: 'resolve', marketId: 'm8', marketTitle: 'US Unemployment — Dec 2024', operator: 'admin@rangex.io', detail: 'Resolved at 4.1% → payoff 44.0¢', timestamp: '2025-01-10T14:00:00Z' },
  { id: 'l6', action: 'resolve', marketId: 'm9', marketTitle: 'Bitcoin — End of 2024', operator: 'admin@rangex.io', detail: 'Resolved at $94,500 → payoff 71.7¢', timestamp: '2025-01-01T12:00:00Z' },
  { id: 'l7', action: 'edit', marketId: 'm4', marketTitle: 'US GDP Growth 2025', operator: 'admin@rangex.io', detail: 'Updated settlement source description', timestamp: '2025-02-01T11:00:00Z' },
];

// ────────────────────────────────── Categories ──────────────────────────────────

export const categories = ['All', 'Rates', 'Inflation', 'FX', 'Macro', 'Equities', 'Commodities', 'Labor', 'Crypto'];

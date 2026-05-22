// Adapter to convert DB market rows to the frontend Market type
import type { DbMarket } from '@/hooks/use-markets';
import type { Market } from '@/lib/types';

export function dbMarketToMarket(db: DbMarket): Market {
  return {
    id: db.id,
    onchainMarketId: db.onchain_market_id == null ? undefined : String(db.onchain_market_id),
    title: db.title,
    description: db.description || '',
    category: db.category,
    variable: db.metric_name,
    unit: db.unit,
    lowerBound: Number(db.lower_bound),
    upperBound: Number(db.upper_bound),
    resolutionDate: db.resolution_date,
    settlementSource: db.settlement_source,
    status: db.status as Market['status'],
    currentPrice: db.current_reference_value
      ? (Number(db.current_reference_value) - Number(db.lower_bound)) / (Number(db.upper_bound) - Number(db.lower_bound))
      : 0.5,
    referenceValue: db.current_reference_value ? Number(db.current_reference_value) : undefined,
    volume24h: 0,
    totalVolume: 0,
    openInterest: 0,
    resolvedValue: db.final_observed_value ? Number(db.final_observed_value) : undefined,
    createdAt: db.created_at,
    trending: false,
  };
}

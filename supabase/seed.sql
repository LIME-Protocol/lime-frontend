-- Initial MVP data for fresh Supabase projects.
-- Idempotent: safe to run more than once.

insert into public.markets (
  title,
  description,
  category,
  metric_name,
  unit,
  lower_bound,
  upper_bound,
  floor_payout,
  ceiling_payout,
  resolution_date,
  settlement_source,
  settlement_url,
  current_reference_value,
  status,
  created_by
)
select
  'Bitcoin — Mid 2026',
  'Continuous payoff market for the BTC/USD reference price at mid-year 2026. Pays linearly from 0 to 1 across the configured range.',
  'Crypto',
  'BTC/USD price',
  'USD',
  80000,
  140000,
  0,
  1,
  '2026-06-30T00:00:00.000Z'::timestamptz,
  'CoinMarketCap BTC/USD close',
  'https://coinmarketcap.com/currencies/bitcoin/',
  104000,
  'draft'::public.market_status,
  (select id from auth.users where email = 'gutobevtorres@gmail.com' limit 1)
where not exists (
  select 1
  from public.markets
  where title = 'Bitcoin — Mid 2026'
);

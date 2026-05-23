alter table public.markets
  add column if not exists onchain_market_id bigint;

create unique index if not exists markets_onchain_market_id_key
  on public.markets (onchain_market_id)
  where onchain_market_id is not null;

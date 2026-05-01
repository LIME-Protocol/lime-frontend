CREATE INDEX IF NOT EXISTS idx_orders_matching
  ON public.orders(market_id, side, price, created_at)
  WHERE status IN ('open','partial');

CREATE INDEX IF NOT EXISTS idx_orders_user_status
  ON public.orders(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trades_market_time
  ON public.trades(market_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_trades_buyer
  ON public.trades(buyer_user_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_trades_seller
  ON public.trades(seller_user_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_positions_user_open
  ON public.positions(user_id)
  WHERE status = 'open' AND net_quantity != 0;

CREATE INDEX IF NOT EXISTS idx_markets_status_resolution
  ON public.markets(status, resolution_date);
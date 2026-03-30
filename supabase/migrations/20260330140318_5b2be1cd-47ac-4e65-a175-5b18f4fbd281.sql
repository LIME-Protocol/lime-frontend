CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'active_markets', (SELECT count(*) FROM markets WHERE status = 'active'),
    'total_volume_24h', COALESCE((
      SELECT sum(price * quantity)
      FROM trades
      WHERE executed_at >= now() - interval '24 hours'
    ), 0),
    'open_positions_value', COALESCE((
      SELECT sum(abs(net_quantity) * average_price)
      FROM positions
      WHERE status = 'open' AND net_quantity != 0
    ), 0),
    'open_positions_count', COALESCE((
      SELECT count(*)
      FROM positions
      WHERE status = 'open' AND net_quantity != 0
    ), 0),
    'closing_24h', (
      SELECT count(*)
      FROM markets
      WHERE status = 'active'
        AND resolution_date > now()
        AND resolution_date <= now() + interval '24 hours'
    )
  );
$$;
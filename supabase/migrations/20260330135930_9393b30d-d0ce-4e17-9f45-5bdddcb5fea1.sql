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
    'total_open_interest', COALESCE((
      SELECT sum(abs(net_quantity) * average_price)
      FROM positions
      WHERE status = 'open'
    ), 0),
    'resolved_24h', (
      SELECT count(*)
      FROM markets
      WHERE status = 'resolved'
        AND updated_at >= now() - interval '24 hours'
    ),
    'closing_soon_id', (
      SELECT id FROM markets
      WHERE status = 'active'
        AND resolution_date > now()
      ORDER BY resolution_date ASC
      LIMIT 1
    )
  );
$$;
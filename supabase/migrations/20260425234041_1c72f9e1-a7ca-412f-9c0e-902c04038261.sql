-- Clean slate on trades grants & policies
REVOKE ALL ON public.trades FROM anon, authenticated;

-- Anon: only safe columns
GRANT SELECT (id, market_id, price, quantity, executed_at) ON public.trades TO anon;

-- Authenticated: only safe columns broadly; identifier columns separately controlled
GRANT SELECT (id, market_id, price, quantity, executed_at) ON public.trades TO authenticated;
GRANT SELECT (buyer_user_id, seller_user_id, buy_order_id, sell_order_id) ON public.trades TO authenticated;

-- Drop existing SELECT policies and rebuild
DROP POLICY IF EXISTS "Anon can read trade ticks" ON public.trades;
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;

-- Single permissive SELECT policy: row visibility is universal,
-- but identifier columns are gated by a CHECK enforced via a SECURITY DEFINER function pattern.
-- Simpler: split into two policies that AND together via "restrictive" type.
CREATE POLICY "All can read tick rows"
ON public.trades
FOR SELECT
TO anon, authenticated
USING (true);

-- Restrictive policy: when querying identifier columns, only buyer/seller can see them.
-- Postgres can't do per-column restrictive policies, so we instead enforce identifier visibility
-- through a SECURITY DEFINER function. Drop the identifier grants from authenticated and use a function.
REVOKE SELECT (buyer_user_id, seller_user_id, buy_order_id, sell_order_id) ON public.trades FROM authenticated;

-- Function to fetch own trades with identifiers (uses definer privileges)
CREATE OR REPLACE FUNCTION public.get_my_trades(p_market_id uuid DEFAULT NULL, p_limit int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  market_id uuid,
  price numeric,
  quantity numeric,
  executed_at timestamptz,
  buyer_user_id uuid,
  seller_user_id uuid,
  buy_order_id uuid,
  sell_order_id uuid,
  side text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    t.id, t.market_id, t.price, t.quantity, t.executed_at,
    t.buyer_user_id, t.seller_user_id, t.buy_order_id, t.sell_order_id,
    CASE WHEN t.buyer_user_id = auth.uid() THEN 'buy' ELSE 'sell' END AS side
  FROM public.trades t
  WHERE (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid())
    AND (p_market_id IS NULL OR t.market_id = p_market_id)
  ORDER BY t.executed_at DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_trades(uuid, int) TO authenticated;
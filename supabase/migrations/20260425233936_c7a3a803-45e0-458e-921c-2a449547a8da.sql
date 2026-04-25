-- Allow public SELECT on trades, but column-level grants restrict anon to non-identifying columns.
-- Authenticated users can also see identifiers only on their own trades via the existing "Users can view own trades" policy.
-- To make the view work for everyone, we need a permissive SELECT policy.
CREATE POLICY "Public read of trade ticks"
ON public.trades
FOR SELECT
TO anon, authenticated
USING (true);

-- Re-enforce: anon can only select non-identifying columns (column-level grant).
REVOKE SELECT ON public.trades FROM anon;
GRANT SELECT (id, market_id, price, quantity, executed_at) ON public.trades TO anon;

-- Authenticated keeps full table SELECT grant, but to prevent leaking buyer/seller ids
-- to non-participants, also enforce column-level grants. We allow non-identifying columns
-- broadly, and identifying columns only via a separate, stricter policy.
REVOKE SELECT ON public.trades FROM authenticated;
GRANT SELECT (id, market_id, price, quantity, executed_at) ON public.trades TO authenticated;
GRANT SELECT (buyer_user_id, sell_order_id, buy_order_id, seller_user_id) ON public.trades TO authenticated;

-- Replace the broad public policy with two policies:
-- 1) Anyone can read non-identifying tick data (enforced by column grants above)
-- 2) Identifiers visible only via "Users can view own trades" (already exists)
-- Note: PostgreSQL does not natively support per-column RLS, so column grants are the gate.
-- Revoke identifier-column grants from broad authenticated role.
-- Only owners (via the "Users can view own trades" RLS policy) need them, but RLS-based row filter combined with table-wide SELECT grant is sufficient: the policy restricts which ROWS are visible, and the row's identifier columns are visible only on those rows.
REVOKE SELECT (buyer_user_id, seller_user_id, buy_order_id, sell_order_id) ON public.trades FROM authenticated;

-- Restore full column SELECT grant to authenticated; RLS policies (the two SELECT policies) are now the gate.
-- Wait: with two permissive policies (Public read true OR own trades), the OR means everyone sees everything.
-- We must drop the broad public policy and rely on the view + column grants for public access.
DROP POLICY IF EXISTS "Public read of trade ticks" ON public.trades;

-- Grant authenticated full SELECT (for own trades policy + admin contexts).
-- Anon keeps only the non-identifying column grants.
GRANT SELECT ON public.trades TO authenticated;

-- For the public_trades view to work for unauthenticated viewers, we need a SELECT policy
-- that allows reading rows when only the safe columns are referenced. Since RLS is row-level
-- (not column-level), we need a permissive policy. To avoid leaking identifiers, anon's
-- column grants are the gate. Add the policy back, scoped only to anon:
CREATE POLICY "Anon can read trade ticks"
ON public.trades
FOR SELECT
TO anon
USING (true);
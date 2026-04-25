-- Replace public_profiles view with security_invoker = true
DROP VIEW IF EXISTS public.public_profiles;

-- Helper function: returns only username for a given user id.
-- Used by comments and other public displays. Wallet address is never exposed.
CREATE OR REPLACE FUNCTION public.get_public_username(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT username FROM public.profiles WHERE id = _user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_username(uuid) TO anon, authenticated;

-- Recreate public_trades view explicitly as security_invoker
-- (already created with security_invoker=true; keeping for idempotency)
DROP VIEW IF EXISTS public.public_trades;
CREATE VIEW public.public_trades
WITH (security_invoker = true) AS
SELECT id, market_id, price, quantity, executed_at
FROM public.trades;
GRANT SELECT ON public.public_trades TO anon, authenticated;

-- public_trades view needs an RLS policy on the underlying table to allow public reads of just price/quantity/timestamp.
-- Add a permissive SELECT policy that exposes only what the view selects (RLS is row-level; the view is the column gate).
CREATE POLICY "Public can view trade ticks via view"
ON public.trades
FOR SELECT
TO anon, authenticated
USING (true);

-- BUT the existing "Users can view own trades" policy still exposes user identifiers when queried directly.
-- To prevent direct table access exposing identifiers, REVOKE column-level SELECT on user id columns from anon.
REVOKE SELECT ON public.trades FROM anon;
GRANT SELECT (id, market_id, price, quantity, executed_at) ON public.trades TO anon;

-- For authenticated, keep full SELECT but RLS scopes user-id columns to participants only via the existing policy.
-- Drop the broad public policy now that the view + grants handle public reads.
DROP POLICY IF EXISTS "Public can view trade ticks via view" ON public.trades;
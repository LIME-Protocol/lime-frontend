-- =========================================================
-- A.1 TRADES: drop public read, add safe public view
-- =========================================================
DROP POLICY IF EXISTS "Anyone can view trades" ON public.trades;

-- Public-safe view: no user identifiers, no order ids
CREATE OR REPLACE VIEW public.public_trades
WITH (security_invoker = true) AS
SELECT
  id,
  market_id,
  price,
  quantity,
  executed_at
FROM public.trades;

GRANT SELECT ON public.public_trades TO anon, authenticated;

-- =========================================================
-- A.2 AUDIT LOGS: scope reads to owner or admin
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;

CREATE POLICY "Users view own audit logs or admins view all"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  actor_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- =========================================================
-- A.3 RESOLUTIONS: admin-only insert
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can create resolutions" ON public.resolutions;

CREATE POLICY "Admins can create resolutions"
ON public.resolutions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = resolved_by
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- =========================================================
-- A.5 PROFILES: hide wallet_address from the public
-- =========================================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Only the owner (or admins) can read full profile rows incl. wallet_address.
CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Public-safe view used by comments and other public listings.
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT
  id,
  username,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
-- Tighten markets policies (admin only for write)
DROP POLICY IF EXISTS "Authenticated users can create markets" ON public.markets;
DROP POLICY IF EXISTS "Creator can update own markets" ON public.markets;

CREATE POLICY "Admins can create markets"
  ON public.markets FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update markets"
  ON public.markets FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tighten market_ranges policies
DROP POLICY IF EXISTS "Authenticated users can create market ranges" ON public.market_ranges;
DROP POLICY IF EXISTS "Authenticated users can update market ranges" ON public.market_ranges;

CREATE POLICY "Admins can create market ranges"
  ON public.market_ranges FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update market ranges"
  ON public.market_ranges FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
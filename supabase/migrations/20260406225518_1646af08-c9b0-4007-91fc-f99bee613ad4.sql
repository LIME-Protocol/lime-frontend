
CREATE TABLE public.market_ranges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  label text NOT NULL,
  lower_bound numeric NOT NULL,
  upper_bound numeric NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'preliminary')),
  current_price numeric DEFAULT 0.5,
  volume_24h numeric DEFAULT 0,
  total_volume numeric DEFAULT 0,
  open_interest numeric DEFAULT 0,
  payoff_curve jsonb DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.market_ranges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market ranges are viewable by everyone"
  ON public.market_ranges FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated users can create market ranges"
  ON public.market_ranges FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update market ranges"
  ON public.market_ranges FOR UPDATE TO authenticated
  USING (true);

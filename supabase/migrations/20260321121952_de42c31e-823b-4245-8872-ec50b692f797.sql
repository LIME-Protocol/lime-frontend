
-- ══════════════════════════════════════════════════════════════
-- RangeX Core Schema
-- ══════════════════════════════════════════════════════════════

-- Enums
CREATE TYPE public.market_status AS ENUM ('draft', 'pending', 'active', 'resolved', 'invalidated', 'cancelled');
CREATE TYPE public.order_side AS ENUM ('buy', 'sell');
CREATE TYPE public.order_type AS ENUM ('market', 'limit');
CREATE TYPE public.order_status AS ENUM ('open', 'partial', 'filled', 'cancelled');
CREATE TYPE public.position_status AS ENUM ('open', 'closed');
CREATE TYPE public.audit_actor_type AS ENUM ('user', 'system', 'admin');
CREATE TYPE public.audit_action AS ENUM ('create', 'update', 'approve', 'resolve', 'invalidate', 'cancel', 'trade', 'order');

-- ── 1. Profiles (linked to auth.users) ──────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. Markets ──────────────────────────────────────────────
CREATE TABLE public.markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  metric_name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '',
  lower_bound NUMERIC NOT NULL,
  upper_bound NUMERIC NOT NULL,
  floor_payout NUMERIC NOT NULL DEFAULT 0,
  ceiling_payout NUMERIC NOT NULL DEFAULT 1,
  resolution_date TIMESTAMPTZ NOT NULL,
  settlement_source TEXT NOT NULL,
  settlement_url TEXT,
  current_reference_value NUMERIC,
  final_observed_value NUMERIC,
  final_payout_value NUMERIC,
  status market_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_bounds CHECK (upper_bound > lower_bound),
  CONSTRAINT valid_payout CHECK (ceiling_payout >= floor_payout)
);

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Markets are viewable by everyone"
  ON public.markets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create markets"
  ON public.markets FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update own markets"
  ON public.markets FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE INDEX idx_markets_status ON public.markets(status);
CREATE INDEX idx_markets_category ON public.markets(category);
CREATE INDEX idx_markets_resolution_date ON public.markets(resolution_date);

-- ── 3. Orders ───────────────────────────────────────────────
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  side order_side NOT NULL,
  order_type order_type NOT NULL DEFAULT 'limit',
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL CHECK (price >= 0 AND price <= 1),
  filled_quantity NUMERIC NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own orders"
  ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_market ON public.orders(market_id);
CREATE INDEX idx_orders_status ON public.orders(status);

-- ── 4. Trades ───────────────────────────────────────────────
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  buy_order_id UUID NOT NULL REFERENCES public.orders(id),
  sell_order_id UUID NOT NULL REFERENCES public.orders(id),
  buyer_user_id UUID NOT NULL REFERENCES auth.users(id),
  seller_user_id UUID NOT NULL REFERENCES auth.users(id),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL CHECK (price >= 0 AND price <= 1),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON public.trades FOR SELECT TO authenticated
  USING (auth.uid() = buyer_user_id OR auth.uid() = seller_user_id);

CREATE INDEX idx_trades_market ON public.trades(market_id);
CREATE INDEX idx_trades_buyer ON public.trades(buyer_user_id);
CREATE INDEX idx_trades_seller ON public.trades(seller_user_id);
CREATE INDEX idx_trades_executed ON public.trades(executed_at DESC);

-- ── 5. Positions ────────────────────────────────────────────
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  net_quantity NUMERIC NOT NULL DEFAULT 0,
  average_price NUMERIC NOT NULL DEFAULT 0,
  estimated_pnl NUMERIC NOT NULL DEFAULT 0,
  realized_pnl NUMERIC NOT NULL DEFAULT 0,
  status position_status NOT NULL DEFAULT 'open',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, market_id)
);

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own positions"
  ON public.positions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own positions"
  ON public.positions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own positions"
  ON public.positions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_positions_user ON public.positions(user_id);
CREATE INDEX idx_positions_market ON public.positions(market_id);

-- ── 6. Resolutions ──────────────────────────────────────────
CREATE TABLE public.resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE UNIQUE,
  observed_value NUMERIC NOT NULL,
  settlement_source_used TEXT NOT NULL,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resolutions are viewable by everyone"
  ON public.resolutions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create resolutions"
  ON public.resolutions FOR INSERT TO authenticated WITH CHECK (auth.uid() = resolved_by);

-- ── 7. Audit Logs ───────────────────────────────────────────
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type audit_actor_type NOT NULL DEFAULT 'user',
  actor_id UUID REFERENCES auth.users(id),
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs"
  ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);

-- ── Shared updated_at trigger ───────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_markets_updated_at
  BEFORE UPDATE ON public.markets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

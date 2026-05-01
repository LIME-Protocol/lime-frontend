-- Saved withdrawal destinations
CREATE TABLE IF NOT EXISTS public.withdrawal_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  method text NOT NULL,
  label text NOT NULL,
  destination text NOT NULL,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, method, destination)
);

ALTER TABLE public.withdrawal_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own destinations"
  ON public.withdrawal_destinations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own destinations"
  ON public.withdrawal_destinations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own destinations"
  ON public.withdrawal_destinations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own destinations"
  ON public.withdrawal_destinations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_withdrawal_destinations_user
  ON public.withdrawal_destinations(user_id, last_used_at DESC);

-- Cancel a pending withdrawal: refund balance + mark transaction cancelled
CREATE OR REPLACE FUNCTION public.cancel_withdrawal(p_tx_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tx RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT * INTO v_tx
  FROM public.transactions
  WHERE id = p_tx_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Transaction not found');
  END IF;

  IF v_tx.user_id != v_uid THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  IF v_tx.type != 'withdraw' OR v_tx.status != 'pending' THEN
    RETURN jsonb_build_object('error', 'Only pending withdrawals can be cancelled');
  END IF;

  -- Refund
  PERFORM public.adjust_balance(v_tx.user_id, v_tx.currency, v_tx.amount);

  UPDATE public.transactions
  SET status = 'cancelled',
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('cancelled_by', 'user'),
      updated_at = now()
  WHERE id = p_tx_id;

  INSERT INTO public.audit_logs (actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES ('user', v_uid, 'cancel', 'withdrawal', p_tx_id, jsonb_build_object('refunded', v_tx.amount));

  RETURN jsonb_build_object('success', true, 'refunded', v_tx.amount);
END;
$$;

-- Aggregated wallet summary
CREATE OR REPLACE FUNCTION public.get_wallet_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_available numeric := 0;
  v_reserved numeric := 0;
  v_lifetime_pnl numeric := 0;
  v_withdrawn_today numeric := 0;
  v_daily_limit numeric := 10000; -- soft limit for UI; can be moved to a config table later
  v_pending_withdraw numeric := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT COALESCE(amount, 0) INTO v_available
  FROM public.balances
  WHERE user_id = v_uid AND currency = 'USD';

  SELECT COALESCE(SUM(
    (quantity - filled_quantity) *
    CASE WHEN side = 'buy' THEN price ELSE (1 - price) END
  ), 0) INTO v_reserved
  FROM public.orders
  WHERE user_id = v_uid AND status IN ('open', 'partial');

  SELECT COALESCE(SUM(realized_pnl), 0) INTO v_lifetime_pnl
  FROM public.positions
  WHERE user_id = v_uid;

  SELECT COALESCE(SUM(amount), 0) INTO v_withdrawn_today
  FROM public.transactions
  WHERE user_id = v_uid
    AND type = 'withdraw'
    AND status IN ('pending', 'confirmed')
    AND created_at >= date_trunc('day', now());

  SELECT COALESCE(SUM(amount), 0) INTO v_pending_withdraw
  FROM public.transactions
  WHERE user_id = v_uid AND type = 'withdraw' AND status = 'pending';

  RETURN jsonb_build_object(
    'available', COALESCE(v_available, 0),
    'reserved', v_reserved,
    'total', COALESCE(v_available, 0) + v_reserved,
    'lifetime_pnl', v_lifetime_pnl,
    'pending_withdraw', v_pending_withdraw,
    'withdrawn_today', v_withdrawn_today,
    'daily_limit', v_daily_limit,
    'daily_remaining', GREATEST(0, v_daily_limit - v_withdrawn_today)
  );
END;
$$;

-- Save / touch a destination (called from client after successful withdraw request)
CREATE OR REPLACE FUNCTION public.upsert_withdrawal_destination(
  p_method text,
  p_label text,
  p_destination text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.withdrawal_destinations (user_id, method, label, destination, last_used_at)
  VALUES (v_uid, p_method, p_label, p_destination, now())
  ON CONFLICT (user_id, method, destination) DO UPDATE
    SET last_used_at = now(),
        label = EXCLUDED.label
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
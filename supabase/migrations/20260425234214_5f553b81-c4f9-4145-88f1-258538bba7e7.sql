-- ============================================================
-- B.1 Add pending_resolution status
-- ============================================================
ALTER TYPE market_status ADD VALUE IF NOT EXISTS 'pending_resolution';

-- ============================================================
-- B.2 Promote overdue markets (called by edge function on cron)
-- ============================================================
CREATE OR REPLACE FUNCTION public.promote_overdue_markets()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE public.markets
  SET status = 'pending_resolution'::market_status, updated_at = now()
  WHERE status = 'active'
    AND resolution_date < now()
    AND final_observed_value IS NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_overdue_markets() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_overdue_markets() TO service_role;

-- ============================================================
-- B.3 settle_market: pays out positions, refunds open orders
-- ============================================================
CREATE OR REPLACE FUNCTION public.settle_market(p_market_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_market RECORD;
  v_position RECORD;
  v_order RECORD;
  v_payoff numeric;
  v_value numeric;
  v_credit numeric;
  v_refund numeric;
  v_positions_settled int := 0;
  v_orders_refunded int := 0;
  v_total_paid numeric := 0;
BEGIN
  SELECT id, status, lower_bound, upper_bound, floor_payout, ceiling_payout,
         final_observed_value, final_payout_value
    INTO v_market
  FROM public.markets WHERE id = p_market_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Market not found');
  END IF;

  IF v_market.status = 'resolved' THEN
    RETURN jsonb_build_object('error', 'Market already resolved', 'idempotent', true);
  END IF;

  IF v_market.final_observed_value IS NULL THEN
    RETURN jsonb_build_object('error', 'No observed value set');
  END IF;

  -- Linear payoff between floor_payout (at lower_bound) and ceiling_payout (at upper_bound).
  -- Clamp value to [lower_bound, upper_bound].
  v_value := GREATEST(v_market.lower_bound,
              LEAST(v_market.upper_bound, v_market.final_observed_value));

  IF v_market.upper_bound = v_market.lower_bound THEN
    v_payoff := v_market.floor_payout;
  ELSE
    v_payoff := v_market.floor_payout
      + (v_value - v_market.lower_bound)
        * (v_market.ceiling_payout - v_market.floor_payout)
        / (v_market.upper_bound - v_market.lower_bound);
  END IF;

  -- Settle each open position
  FOR v_position IN
    SELECT id, user_id, net_quantity, average_price
    FROM public.positions
    WHERE market_id = p_market_id
      AND status = 'open'
      AND net_quantity != 0
    FOR UPDATE
  LOOP
    -- Long positions get paid v_payoff per contract.
    -- Short positions paid (1 - v_payoff) per contract — they sold the upside.
    IF v_position.net_quantity > 0 THEN
      v_credit := v_position.net_quantity * v_payoff;
    ELSE
      v_credit := ABS(v_position.net_quantity) * (1 - v_payoff);
    END IF;

    PERFORM public.adjust_balance(v_position.user_id, 'USD', v_credit);

    UPDATE public.positions
    SET status = 'closed'::position_status,
        realized_pnl = realized_pnl + (v_credit - ABS(v_position.net_quantity) * v_position.average_price),
        updated_at = now()
    WHERE id = v_position.id;

    v_positions_settled := v_positions_settled + 1;
    v_total_paid := v_total_paid + v_credit;
  END LOOP;

  -- Refund any still-open orders (cost was reserved up-front)
  FOR v_order IN
    SELECT id, user_id, side, price, quantity, filled_quantity
    FROM public.orders
    WHERE market_id = p_market_id
      AND status IN ('open', 'partial')
    FOR UPDATE
  LOOP
    v_refund := (v_order.quantity - v_order.filled_quantity)
                * (CASE WHEN v_order.side = 'buy' THEN v_order.price
                        ELSE (1 - v_order.price) END);
    IF v_refund > 0 THEN
      PERFORM public.adjust_balance(v_order.user_id, 'USD', v_refund);
    END IF;
    UPDATE public.orders SET status = 'cancelled'::order_status WHERE id = v_order.id;
    v_orders_refunded := v_orders_refunded + 1;
  END LOOP;

  -- Mark market resolved
  UPDATE public.markets
  SET status = 'resolved'::market_status,
      final_payout_value = v_payoff,
      updated_at = now()
  WHERE id = p_market_id;

  -- Audit
  INSERT INTO public.audit_logs (actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES ('system', NULL, 'settle', 'market', p_market_id,
          jsonb_build_object(
            'observed_value', v_market.final_observed_value,
            'payoff_per_contract', v_payoff,
            'positions_settled', v_positions_settled,
            'orders_refunded', v_orders_refunded,
            'total_paid', v_total_paid
          ));

  RETURN jsonb_build_object(
    'success', true,
    'payoff_per_contract', v_payoff,
    'positions_settled', v_positions_settled,
    'orders_refunded', v_orders_refunded,
    'total_paid', v_total_paid
  );
END;
$$;

REVOKE ALL ON FUNCTION public.settle_market(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_market(uuid) TO service_role;

-- ============================================================
-- B.4 Trigger: when an admin inserts a resolution, auto-settle
-- ============================================================
CREATE OR REPLACE FUNCTION public.trg_resolutions_settle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Persist the observed value on the market first
  UPDATE public.markets
  SET final_observed_value = NEW.observed_value,
      updated_at = now()
  WHERE id = NEW.market_id;

  -- Settle (idempotent)
  PERFORM public.settle_market(NEW.market_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS resolutions_settle_trg ON public.resolutions;
CREATE TRIGGER resolutions_settle_trg
AFTER INSERT ON public.resolutions
FOR EACH ROW
EXECUTE FUNCTION public.trg_resolutions_settle();
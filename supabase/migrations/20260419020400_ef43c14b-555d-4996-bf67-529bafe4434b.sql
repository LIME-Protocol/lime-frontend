-- Atomic credit helper (used by both place_order/cancel)
CREATE OR REPLACE FUNCTION public.adjust_balance(p_user_id UUID, p_currency TEXT, p_delta NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO balances (user_id, currency, amount)
  VALUES (p_user_id, p_currency, p_delta)
  ON CONFLICT (user_id, currency) DO UPDATE
    SET amount = balances.amount + EXCLUDED.amount,
        updated_at = now();
END;
$$;

-- Ensure unique (user_id, currency) for upsert
DO $$ BEGIN
  ALTER TABLE public.balances ADD CONSTRAINT balances_user_currency_unique UNIQUE (user_id, currency);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN duplicate_table THEN NULL; END $$;

-- Updated place_order_and_match with balance validation
CREATE OR REPLACE FUNCTION public.place_order_and_match(
  p_user_id UUID, p_market_id UUID, p_side order_side,
  p_order_type order_type, p_quantity NUMERIC, p_price NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_remaining NUMERIC := p_quantity;
  v_match RECORD;
  v_trade_qty NUMERIC;
  v_trade_price NUMERIC;
  v_trade_id UUID;
  v_last_trade_price NUMERIC;
  v_market_status market_status;
  v_trades_created INT := 0;
  v_cost NUMERIC;
  v_balance NUMERIC;
  v_position_qty NUMERIC;
BEGIN
  -- Validate market is active
  SELECT status INTO v_market_status FROM markets WHERE id = p_market_id;
  IF v_market_status IS NULL THEN
    RETURN jsonb_build_object('error', 'Market not found');
  END IF;
  IF v_market_status != 'active' THEN
    RETURN jsonb_build_object('error', 'Market is not active for trading');
  END IF;

  IF p_price < 0 OR p_price > 1 THEN
    RETURN jsonb_build_object('error', 'Price must be between 0 and 1');
  END IF;
  IF p_quantity <= 0 THEN
    RETURN jsonb_build_object('error', 'Quantity must be positive');
  END IF;

  -- Reserved cost: buyer pays price; seller pays (1 - price)
  v_cost := p_quantity * (CASE WHEN p_side = 'buy' THEN p_price ELSE (1 - p_price) END);

  -- Lock balance row & validate funds
  SELECT amount INTO v_balance
  FROM balances WHERE user_id = p_user_id AND currency = 'USD'
  FOR UPDATE;

  IF v_balance IS NULL OR v_balance < v_cost THEN
    RETURN jsonb_build_object(
      'error', 'Insufficient balance',
      'required', v_cost,
      'available', COALESCE(v_balance, 0)
    );
  END IF;

  -- Debit reservation up-front
  UPDATE balances SET amount = amount - v_cost, updated_at = now()
  WHERE user_id = p_user_id AND currency = 'USD';

  -- Insert the new order
  INSERT INTO orders (user_id, market_id, side, order_type, quantity, price, filled_quantity, status)
  VALUES (p_user_id, p_market_id, p_side, p_order_type, p_quantity, p_price, 0, 'open')
  RETURNING id INTO v_order_id;

  FOR v_match IN
    SELECT o.id, o.user_id, o.price, o.quantity, o.filled_quantity,
           (o.quantity - o.filled_quantity) as available
    FROM orders o
    WHERE o.market_id = p_market_id
      AND o.status IN ('open', 'partial')
      AND o.id != v_order_id
      AND o.user_id != p_user_id
      AND CASE
        WHEN p_side = 'buy' THEN o.side = 'sell' AND o.price <= p_price
        WHEN p_side = 'sell' THEN o.side = 'buy' AND o.price >= p_price
      END
    ORDER BY
      CASE WHEN p_side = 'buy' THEN o.price END ASC,
      CASE WHEN p_side = 'sell' THEN o.price END DESC,
      o.created_at ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    EXIT WHEN v_remaining <= 0;

    v_trade_qty := LEAST(v_remaining, v_match.available);
    v_trade_price := v_match.price;

    INSERT INTO trades (
      market_id, buy_order_id, sell_order_id,
      buyer_user_id, seller_user_id, quantity, price
    ) VALUES (
      p_market_id,
      CASE WHEN p_side = 'buy' THEN v_order_id ELSE v_match.id END,
      CASE WHEN p_side = 'sell' THEN v_order_id ELSE v_match.id END,
      CASE WHEN p_side = 'buy' THEN p_user_id ELSE v_match.user_id END,
      CASE WHEN p_side = 'sell' THEN p_user_id ELSE v_match.user_id END,
      v_trade_qty, v_trade_price
    ) RETURNING id INTO v_trade_id;

    -- If the incoming order traded at a price BETTER than its limit, refund the difference
    IF p_side = 'buy' AND v_trade_price < p_price THEN
      PERFORM public.adjust_balance(p_user_id, 'USD', v_trade_qty * (p_price - v_trade_price));
    ELSIF p_side = 'sell' AND v_trade_price > p_price THEN
      PERFORM public.adjust_balance(p_user_id, 'USD', v_trade_qty * (v_trade_price - p_price));
    END IF;

    -- Update matched (resting) order
    UPDATE orders SET
      filled_quantity = filled_quantity + v_trade_qty,
      status = CASE
        WHEN filled_quantity + v_trade_qty >= quantity THEN 'filled'::order_status
        ELSE 'partial'::order_status
      END
    WHERE id = v_match.id;

    -- Position updates (buyer +qty, seller -qty)
    INSERT INTO positions (user_id, market_id, net_quantity, average_price, status)
    VALUES (
      CASE WHEN p_side = 'buy' THEN p_user_id ELSE v_match.user_id END,
      p_market_id, v_trade_qty, v_trade_price, 'open'
    )
    ON CONFLICT (user_id, market_id) DO UPDATE SET
      average_price = CASE
        WHEN positions.net_quantity + v_trade_qty = 0 THEN 0
        ELSE (positions.average_price * positions.net_quantity + v_trade_price * v_trade_qty)
             / (positions.net_quantity + v_trade_qty)
      END,
      net_quantity = positions.net_quantity + v_trade_qty,
      status = CASE WHEN positions.net_quantity + v_trade_qty = 0 THEN 'closed'::position_status ELSE 'open'::position_status END,
      updated_at = now();

    INSERT INTO positions (user_id, market_id, net_quantity, average_price, status)
    VALUES (
      CASE WHEN p_side = 'sell' THEN p_user_id ELSE v_match.user_id END,
      p_market_id, -v_trade_qty, v_trade_price, 'open'
    )
    ON CONFLICT (user_id, market_id) DO UPDATE SET
      average_price = CASE
        WHEN positions.net_quantity - v_trade_qty = 0 THEN 0
        ELSE (positions.average_price * ABS(positions.net_quantity) + v_trade_price * v_trade_qty)
             / (ABS(positions.net_quantity) + v_trade_qty)
      END,
      net_quantity = positions.net_quantity - v_trade_qty,
      status = CASE WHEN positions.net_quantity - v_trade_qty = 0 THEN 'closed'::position_status ELSE 'open'::position_status END,
      updated_at = now();

    v_remaining := v_remaining - v_trade_qty;
    v_last_trade_price := v_trade_price;
    v_trades_created := v_trades_created + 1;
  END LOOP;

  -- Update incoming order status
  UPDATE orders SET
    filled_quantity = p_quantity - v_remaining,
    status = CASE
      WHEN v_remaining = 0 THEN 'filled'::order_status
      WHEN v_remaining < p_quantity THEN 'partial'::order_status
      ELSE 'open'::order_status
    END
  WHERE id = v_order_id;

  -- Market order: refund unfilled remainder & cancel
  IF p_order_type = 'market' AND v_remaining > 0 THEN
    PERFORM public.adjust_balance(
      p_user_id, 'USD',
      v_remaining * (CASE WHEN p_side = 'buy' THEN p_price ELSE (1 - p_price) END)
    );
    UPDATE orders SET status = 'cancelled'::order_status WHERE id = v_order_id;
  END IF;

  INSERT INTO audit_logs (actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES ('user', p_user_id, 'order', 'order', v_order_id, jsonb_build_object(
    'side', p_side, 'order_type', p_order_type, 'quantity', p_quantity,
    'price', p_price, 'trades_matched', v_trades_created, 'filled', p_quantity - v_remaining
  ));

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'status', CASE
      WHEN p_order_type = 'market' AND v_remaining > 0 THEN 'cancelled'
      WHEN v_remaining = 0 THEN 'filled'
      WHEN v_remaining < p_quantity THEN 'partial'
      ELSE 'open'
    END,
    'filled', p_quantity - v_remaining,
    'trades', v_trades_created,
    'last_price', v_last_trade_price
  );
END;
$$;

-- Updated cancel_order: refunds the unfilled reserved amount
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_unfilled NUMERIC;
  v_refund NUMERIC;
BEGIN
  SELECT id, user_id, status, market_id, side, price, quantity, filled_quantity
    INTO v_order
  FROM orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Order not found');
  END IF;
  IF v_order.user_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;
  IF v_order.status NOT IN ('open', 'partial') THEN
    RETURN jsonb_build_object('error', 'Order cannot be cancelled in current status: ' || v_order.status);
  END IF;

  v_unfilled := v_order.quantity - v_order.filled_quantity;
  v_refund := v_unfilled * (CASE WHEN v_order.side = 'buy' THEN v_order.price ELSE (1 - v_order.price) END);

  UPDATE orders SET status = 'cancelled'::order_status WHERE id = p_order_id;

  IF v_refund > 0 THEN
    PERFORM public.adjust_balance(v_order.user_id, 'USD', v_refund);
  END IF;

  INSERT INTO audit_logs (actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES ('user', auth.uid(), 'cancel', 'order', p_order_id,
          jsonb_build_object('market_id', v_order.market_id, 'refunded', v_refund));

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'refunded', v_refund);
END;
$$;

-- Realtime publication for live orderbook & trades
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.trades REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
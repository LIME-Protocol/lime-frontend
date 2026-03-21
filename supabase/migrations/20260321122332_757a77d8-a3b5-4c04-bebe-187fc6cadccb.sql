
-- ══════════════════════════════════════════════════════════════
-- Simplified matching engine as a database function
-- ══════════════════════════════════════════════════════════════

-- Function: place_order_and_match
-- 1. Inserts the order
-- 2. Tries to match against opposite-side open orders (price-time priority)
-- 3. Creates trades for matches
-- 4. Upserts positions for both parties
-- 5. Updates market current_reference_value based on last trade price
-- 6. Logs to audit_logs

CREATE OR REPLACE FUNCTION public.place_order_and_match(
  p_user_id UUID,
  p_market_id UUID,
  p_side order_side,
  p_order_type order_type,
  p_quantity NUMERIC,
  p_price NUMERIC
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
BEGIN
  -- Validate market is active
  SELECT status INTO v_market_status FROM markets WHERE id = p_market_id;
  IF v_market_status IS NULL THEN
    RETURN jsonb_build_object('error', 'Market not found');
  END IF;
  IF v_market_status != 'active' THEN
    RETURN jsonb_build_object('error', 'Market is not active for trading');
  END IF;

  -- Validate price
  IF p_price < 0 OR p_price > 1 THEN
    RETURN jsonb_build_object('error', 'Price must be between 0 and 1');
  END IF;

  -- Insert the new order
  INSERT INTO orders (user_id, market_id, side, order_type, quantity, price, filled_quantity, status)
  VALUES (p_user_id, p_market_id, p_side, p_order_type, p_quantity, p_price, 0, 'open')
  RETURNING id INTO v_order_id;

  -- Try to match against opposite side orders
  -- For buy orders: match against sells with price <= buy price (lowest sell first)
  -- For sell orders: match against buys with price >= sell price (highest buy first)
  FOR v_match IN
    SELECT o.id, o.user_id, o.price, o.quantity, o.filled_quantity,
           (o.quantity - o.filled_quantity) as available
    FROM orders o
    WHERE o.market_id = p_market_id
      AND o.status IN ('open', 'partial')
      AND o.id != v_order_id
      AND o.user_id != p_user_id  -- no self-matching
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
    -- Trade executes at the resting order's price (maker price)
    v_trade_price := v_match.price;

    -- Create trade
    INSERT INTO trades (
      market_id,
      buy_order_id, sell_order_id,
      buyer_user_id, seller_user_id,
      quantity, price
    ) VALUES (
      p_market_id,
      CASE WHEN p_side = 'buy' THEN v_order_id ELSE v_match.id END,
      CASE WHEN p_side = 'sell' THEN v_order_id ELSE v_match.id END,
      CASE WHEN p_side = 'buy' THEN p_user_id ELSE v_match.user_id END,
      CASE WHEN p_side = 'sell' THEN p_user_id ELSE v_match.user_id END,
      v_trade_qty,
      v_trade_price
    ) RETURNING id INTO v_trade_id;

    -- Update matched (resting) order
    UPDATE orders SET
      filled_quantity = filled_quantity + v_trade_qty,
      status = CASE
        WHEN filled_quantity + v_trade_qty >= quantity THEN 'filled'::order_status
        ELSE 'partial'::order_status
      END
    WHERE id = v_match.id;

    -- Update positions for both parties
    -- Buyer gets positive qty, seller gets negative qty
    INSERT INTO positions (user_id, market_id, net_quantity, average_price, status)
    VALUES (
      CASE WHEN p_side = 'buy' THEN p_user_id ELSE v_match.user_id END,
      p_market_id,
      v_trade_qty,
      v_trade_price,
      'open'
    )
    ON CONFLICT (user_id, market_id) DO UPDATE SET
      average_price = CASE
        WHEN positions.net_quantity + v_trade_qty = 0 THEN 0
        ELSE (positions.average_price * positions.net_quantity + v_trade_price * v_trade_qty)
             / (positions.net_quantity + v_trade_qty)
      END,
      net_quantity = positions.net_quantity + v_trade_qty,
      status = CASE
        WHEN positions.net_quantity + v_trade_qty = 0 THEN 'closed'::position_status
        ELSE 'open'::position_status
      END;

    -- Seller position (negative quantity)
    INSERT INTO positions (user_id, market_id, net_quantity, average_price, status)
    VALUES (
      CASE WHEN p_side = 'sell' THEN p_user_id ELSE v_match.user_id END,
      p_market_id,
      -v_trade_qty,
      v_trade_price,
      'open'
    )
    ON CONFLICT (user_id, market_id) DO UPDATE SET
      average_price = CASE
        WHEN positions.net_quantity - v_trade_qty = 0 THEN 0
        ELSE (positions.average_price * ABS(positions.net_quantity) + v_trade_price * v_trade_qty)
             / (ABS(positions.net_quantity) + v_trade_qty)
      END,
      net_quantity = positions.net_quantity - v_trade_qty,
      status = CASE
        WHEN positions.net_quantity - v_trade_qty = 0 THEN 'closed'::position_status
        ELSE 'open'::position_status
      END;

    v_remaining := v_remaining - v_trade_qty;
    v_last_trade_price := v_trade_price;
    v_trades_created := v_trades_created + 1;
  END LOOP;

  -- Update the incoming order status
  UPDATE orders SET
    filled_quantity = p_quantity - v_remaining,
    status = CASE
      WHEN v_remaining = 0 THEN 'filled'::order_status
      WHEN v_remaining < p_quantity THEN 'partial'::order_status
      ELSE 'open'::order_status
    END
  WHERE id = v_order_id;

  -- If market order and not fully filled, cancel remainder
  IF p_order_type = 'market' AND v_remaining > 0 THEN
    UPDATE orders SET status = 'cancelled'::order_status WHERE id = v_order_id;
  END IF;

  -- Update market price if trades occurred
  IF v_last_trade_price IS NOT NULL THEN
    UPDATE markets SET current_reference_value = NULL WHERE id = p_market_id;
    -- We don't have a current_price column in DB, but we track via last trade
  END IF;

  -- Audit log
  INSERT INTO audit_logs (actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES ('user', p_user_id, 'order', 'order', v_order_id, jsonb_build_object(
    'side', p_side,
    'order_type', p_order_type,
    'quantity', p_quantity,
    'price', p_price,
    'trades_matched', v_trades_created,
    'filled', p_quantity - v_remaining
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

-- Function to get last trade price for a market (used as "current price")
CREATE OR REPLACE FUNCTION public.get_market_last_price(p_market_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT price FROM trades
  WHERE market_id = p_market_id
  ORDER BY executed_at DESC
  LIMIT 1;
$$;

-- Allow RPC calls from authenticated users
GRANT EXECUTE ON FUNCTION public.place_order_and_match TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_market_last_price TO authenticated;

-- Also allow anon to read markets and trades for the explore page
CREATE POLICY "Anyone can view trades" ON public.trades FOR SELECT USING (true);

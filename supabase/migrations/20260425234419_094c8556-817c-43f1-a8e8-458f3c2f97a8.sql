-- request_withdrawal: user-initiated, atomic
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_amount numeric,
  p_currency text,
  p_method text,
  p_destination text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_tx_id uuid;
  v_allowed_methods text[] := ARRAY['PIX', 'USDC', 'BTC', 'ETH', 'WIRE'];
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('error', 'Amount must be positive');
  END IF;

  IF p_currency IS NULL OR length(p_currency) = 0 THEN
    RETURN jsonb_build_object('error', 'Currency required');
  END IF;

  IF NOT (p_method = ANY(v_allowed_methods)) THEN
    RETURN jsonb_build_object('error', 'Method not supported');
  END IF;

  IF p_destination IS NULL OR length(trim(p_destination)) = 0 THEN
    RETURN jsonb_build_object('error', 'Destination required');
  END IF;

  -- Lock the balance row
  SELECT amount INTO v_balance
  FROM public.balances
  WHERE user_id = v_uid AND currency = p_currency
  FOR UPDATE;

  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN jsonb_build_object(
      'error', 'Insufficient balance',
      'available', COALESCE(v_balance, 0),
      'requested', p_amount
    );
  END IF;

  -- Debit + transaction
  UPDATE public.balances
  SET amount = amount - p_amount, updated_at = now()
  WHERE user_id = v_uid AND currency = p_currency;

  INSERT INTO public.transactions (user_id, type, method, currency, amount, status, metadata)
  VALUES (v_uid, 'withdraw', p_method, p_currency, p_amount, 'pending',
          jsonb_build_object('destination', p_destination))
  RETURNING id INTO v_tx_id;

  INSERT INTO public.audit_logs (actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES ('user', v_uid, 'request', 'withdrawal', v_tx_id,
          jsonb_build_object('amount', p_amount, 'currency', p_currency, 'method', p_method));

  RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'status', 'pending');
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_withdrawal(numeric, text, text, text) TO authenticated;

-- Admin approval / rejection
CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_tx_id uuid, p_external_ref text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tx RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  SELECT * INTO v_tx FROM public.transactions WHERE id = p_tx_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Transaction not found');
  END IF;
  IF v_tx.type != 'withdraw' OR v_tx.status != 'pending' THEN
    RETURN jsonb_build_object('error', 'Only pending withdrawals can be approved');
  END IF;

  UPDATE public.transactions
  SET status = 'confirmed',
      tx_hash = COALESCE(p_external_ref, tx_hash),
      updated_at = now()
  WHERE id = p_tx_id;

  INSERT INTO public.audit_logs (actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES ('admin', auth.uid(), 'approve', 'withdrawal', p_tx_id, jsonb_build_object('external_ref', p_external_ref));

  RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.approve_withdrawal(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_tx_id uuid, p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tx RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  SELECT * INTO v_tx FROM public.transactions WHERE id = p_tx_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Transaction not found');
  END IF;
  IF v_tx.type != 'withdraw' OR v_tx.status != 'pending' THEN
    RETURN jsonb_build_object('error', 'Only pending withdrawals can be rejected');
  END IF;

  -- Refund balance
  PERFORM public.adjust_balance(v_tx.user_id, v_tx.currency, v_tx.amount);

  UPDATE public.transactions
  SET status = 'cancelled',
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('rejection_reason', p_reason),
      updated_at = now()
  WHERE id = p_tx_id;

  PERFORM public.notify_user(
    v_tx.user_id,
    'withdrawal_rejected',
    'Withdrawal rejected',
    'Your withdrawal of ' || v_tx.amount || ' ' || v_tx.currency || ' was rejected and refunded.'
      || COALESCE(' Reason: ' || p_reason, ''),
    NULL,
    jsonb_build_object('amount', v_tx.amount, 'currency', v_tx.currency)
  );

  INSERT INTO public.audit_logs (actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES ('admin', auth.uid(), 'reject', 'withdrawal', p_tx_id, jsonb_build_object('reason', p_reason));

  RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.reject_withdrawal(uuid, text) TO authenticated;
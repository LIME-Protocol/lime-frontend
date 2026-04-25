-- ============================================================
-- C.1 notifications table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,                    -- 'order_filled' | 'market_resolved' | 'order_cancelled'
  title text NOT NULL,
  body text,
  market_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Owner-only SELECT/UPDATE
CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users mark own notifications read"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- No INSERT policy → only SECURITY DEFINER functions/triggers can insert.

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, read_at, created_at DESC);

-- ============================================================
-- C.2 Helper to insert notifications (used by triggers)
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_user(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text DEFAULT NULL,
  p_market_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, market_id, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_market_id, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ============================================================
-- C.3 Trigger: trades → notify buyer + seller
-- ============================================================
CREATE OR REPLACE FUNCTION public.trg_trades_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_market_title text;
BEGIN
  SELECT title INTO v_market_title FROM public.markets WHERE id = NEW.market_id;

  PERFORM public.notify_user(
    NEW.buyer_user_id,
    'order_filled',
    'Buy filled',
    'Bought ' || NEW.quantity || ' contracts at ' || ROUND(NEW.price * 100, 1) || '¢ — ' || COALESCE(v_market_title, 'market'),
    NEW.market_id,
    jsonb_build_object('side', 'buy', 'price', NEW.price, 'quantity', NEW.quantity)
  );

  PERFORM public.notify_user(
    NEW.seller_user_id,
    'order_filled',
    'Sell filled',
    'Sold ' || NEW.quantity || ' contracts at ' || ROUND(NEW.price * 100, 1) || '¢ — ' || COALESCE(v_market_title, 'market'),
    NEW.market_id,
    jsonb_build_object('side', 'sell', 'price', NEW.price, 'quantity', NEW.quantity)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trades_notify_trg ON public.trades;
CREATE TRIGGER trades_notify_trg
AFTER INSERT ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_notify();

-- ============================================================
-- C.4 Trigger: resolutions → notify all position holders
-- ============================================================
CREATE OR REPLACE FUNCTION public.trg_resolutions_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_market_title text;
  v_user_id uuid;
BEGIN
  SELECT title INTO v_market_title FROM public.markets WHERE id = NEW.market_id;

  FOR v_user_id IN
    SELECT DISTINCT user_id FROM public.positions
    WHERE market_id = NEW.market_id
  LOOP
    PERFORM public.notify_user(
      v_user_id,
      'market_resolved',
      'Market resolved',
      COALESCE(v_market_title, 'A market') || ' resolved at ' || NEW.observed_value,
      NEW.market_id,
      jsonb_build_object('observed_value', NEW.observed_value)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS resolutions_notify_trg ON public.resolutions;
CREATE TRIGGER resolutions_notify_trg
AFTER INSERT ON public.resolutions
FOR EACH ROW
EXECUTE FUNCTION public.trg_resolutions_notify();

-- ============================================================
-- C.5 Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
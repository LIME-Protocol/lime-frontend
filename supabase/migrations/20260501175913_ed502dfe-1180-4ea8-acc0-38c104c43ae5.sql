CREATE OR REPLACE FUNCTION public.validate_order()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Quantity: positive integer
  IF NEW.quantity IS NULL OR NEW.quantity < 1 THEN
    RAISE EXCEPTION 'Quantity must be at least 1 (got %)', NEW.quantity
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.quantity <> floor(NEW.quantity) THEN
    RAISE EXCEPTION 'Quantity must be a whole number (got %)', NEW.quantity
      USING ERRCODE = 'check_violation';
  END IF;

  -- Price: bounded strictly inside (0, 1) to prevent wash trades at extremes
  IF NEW.price IS NULL OR NEW.price < 0.01 OR NEW.price > 0.99 THEN
    RAISE EXCEPTION 'Price must be between 0.01 and 0.99 (got %)', NEW.price
      USING ERRCODE = 'check_violation';
  END IF;

  -- Filled quantity sanity
  IF NEW.filled_quantity IS NULL OR NEW.filled_quantity < 0 THEN
    RAISE EXCEPTION 'Filled quantity cannot be negative (got %)', NEW.filled_quantity
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.filled_quantity > NEW.quantity THEN
    RAISE EXCEPTION 'Filled quantity (%) cannot exceed total quantity (%)',
      NEW.filled_quantity, NEW.quantity
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_validate_before_insert ON public.orders;
CREATE TRIGGER orders_validate_before_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order();

DROP TRIGGER IF EXISTS orders_validate_before_update ON public.orders;
CREATE TRIGGER orders_validate_before_update
  BEFORE UPDATE OF quantity, price, filled_quantity ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order();
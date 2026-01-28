-- Create a function to validate GPS proximity for agent visits
-- This enforces the 100 meter rule at the database level
CREATE OR REPLACE FUNCTION public.validate_visit_proximity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  customer_lat NUMERIC;
  customer_lng NUMERIC;
  distance NUMERIC;
BEGIN
  -- Get customer location
  SELECT location_lat, location_lng 
  INTO customer_lat, customer_lng
  FROM customers 
  WHERE id = NEW.customer_id;
  
  -- Skip validation if customer has no location set
  IF customer_lat IS NULL OR customer_lng IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Skip validation if visit has no location (allow for edge cases)
  IF NEW.location_lat IS NULL OR NEW.location_lng IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate distance using Haversine formula (result in meters)
  -- 6371000 is Earth's radius in meters
  distance := 6371000 * acos(
    LEAST(1.0, GREATEST(-1.0,
      cos(radians(customer_lat)) * cos(radians(NEW.location_lat)) *
      cos(radians(NEW.location_lng) - radians(customer_lng)) +
      sin(radians(customer_lat)) * sin(radians(NEW.location_lat))
    ))
  );
  
  -- Enforce 100 meter rule
  IF distance > 100 THEN
    RAISE EXCEPTION 'Visit location must be within 100 meters of customer location. Current distance: % meters', ROUND(distance);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate proximity before insert
CREATE TRIGGER check_visit_proximity_before_insert
  BEFORE INSERT ON public.agent_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_visit_proximity();
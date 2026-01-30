-- Add CHECK constraints for data validation across tables
-- This prevents invalid data insertion even if client-side validation is bypassed

-- Invoices
ALTER TABLE invoices
ADD CONSTRAINT check_subtotal_positive CHECK (subtotal >= 0),
ADD CONSTRAINT check_discount_positive CHECK (discount_amount IS NULL OR discount_amount >= 0),
ADD CONSTRAINT check_vat_positive CHECK (vat_amount IS NULL OR vat_amount >= 0),
ADD CONSTRAINT check_total_positive CHECK (total_amount >= 0);

-- Invoice Items  
ALTER TABLE invoice_items
ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0),
ADD CONSTRAINT check_unit_price_positive CHECK (unit_price >= 0),
ADD CONSTRAINT check_discount_percent_range CHECK (discount_percent IS NULL OR (discount_percent >= 0 AND discount_percent <= 100)),
ADD CONSTRAINT check_vat_amount_positive CHECK (vat_amount IS NULL OR vat_amount >= 0),
ADD CONSTRAINT check_line_total_positive CHECK (line_total >= 0);

-- GPS Coordinates for customers
ALTER TABLE customers
ADD CONSTRAINT check_latitude_range CHECK (location_lat IS NULL OR (location_lat >= -90 AND location_lat <= 90)),
ADD CONSTRAINT check_longitude_range CHECK (location_lng IS NULL OR (location_lng >= -180 AND location_lng <= 180)),
ADD CONSTRAINT check_credit_limit_nonnegative CHECK (credit_limit IS NULL OR credit_limit >= 0);

-- GPS Coordinates for agent_locations
ALTER TABLE agent_locations
ADD CONSTRAINT check_agent_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
ADD CONSTRAINT check_agent_longitude_range CHECK (longitude >= -180 AND longitude <= 180);

-- GPS Coordinates for agent_visits
ALTER TABLE agent_visits
ADD CONSTRAINT check_visit_latitude_range CHECK (location_lat IS NULL OR (location_lat >= -90 AND location_lat <= 90)),
ADD CONSTRAINT check_visit_longitude_range CHECK (location_lng IS NULL OR (location_lng >= -180 AND location_lng <= 180));

-- Products
ALTER TABLE products
ADD CONSTRAINT check_unit_price_positive CHECK (unit_price >= 0),
ADD CONSTRAINT check_cost_price_positive CHECK (cost_price IS NULL OR cost_price >= 0),
ADD CONSTRAINT check_stock_quantity_nonnegative CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
ADD CONSTRAINT check_vat_rate_range CHECK (vat_rate IS NULL OR (vat_rate >= 0 AND vat_rate <= 100)),
ADD CONSTRAINT check_pieces_per_carton_positive CHECK (pieces_per_carton IS NULL OR pieces_per_carton >= 1),
ADD CONSTRAINT check_min_stock_level_nonnegative CHECK (min_stock_level IS NULL OR min_stock_level >= 0),
ADD CONSTRAINT check_carton_price_positive CHECK (carton_price IS NULL OR carton_price >= 0);

-- Agents - GPS and targets
ALTER TABLE agents
ADD CONSTRAINT check_agent_last_lat_range CHECK (last_location_lat IS NULL OR (last_location_lat >= -90 AND last_location_lat <= 90)),
ADD CONSTRAINT check_agent_last_lng_range CHECK (last_location_lng IS NULL OR (last_location_lng >= -180 AND last_location_lng <= 180)),
ADD CONSTRAINT check_monthly_target_nonnegative CHECK (monthly_target IS NULL OR monthly_target >= 0),
ADD CONSTRAINT check_tons_target_nonnegative CHECK (tons_target IS NULL OR tons_target >= 0),
ADD CONSTRAINT check_cartons_target_nonnegative CHECK (cartons_target IS NULL OR cartons_target >= 0),
ADD CONSTRAINT check_credit_balance_nonnegative CHECK (credit_balance IS NULL OR credit_balance >= 0),
ADD CONSTRAINT check_current_sales_nonnegative CHECK (current_sales IS NULL OR current_sales >= 0);

-- Reconciliations
ALTER TABLE reconciliations
ADD CONSTRAINT check_total_loaded_nonnegative CHECK (total_loaded IS NULL OR total_loaded >= 0),
ADD CONSTRAINT check_total_sold_nonnegative CHECK (total_sold IS NULL OR total_sold >= 0),
ADD CONSTRAINT check_total_returned_nonnegative CHECK (total_returned IS NULL OR total_returned >= 0),
ADD CONSTRAINT check_total_damaged_nonnegative CHECK (total_damaged IS NULL OR total_damaged >= 0),
ADD CONSTRAINT check_cash_collected_nonnegative CHECK (cash_collected IS NULL OR cash_collected >= 0),
ADD CONSTRAINT check_expected_cash_nonnegative CHECK (expected_cash IS NULL OR expected_cash >= 0),
ADD CONSTRAINT check_damage_value_nonnegative CHECK (damage_value IS NULL OR damage_value >= 0),
ADD CONSTRAINT check_return_value_nonnegative CHECK (return_value IS NULL OR return_value >= 0);

-- Reconciliation Items
ALTER TABLE reconciliation_items
ADD CONSTRAINT check_loaded_quantity_nonnegative CHECK (loaded_quantity >= 0),
ADD CONSTRAINT check_sold_quantity_nonnegative CHECK (sold_quantity >= 0),
ADD CONSTRAINT check_returned_quantity_nonnegative CHECK (returned_quantity >= 0),
ADD CONSTRAINT check_remaining_quantity_nonnegative CHECK (remaining_quantity >= 0),
ADD CONSTRAINT check_damaged_quantity_nonnegative CHECK (damaged_quantity >= 0),
ADD CONSTRAINT check_item_unit_price_positive CHECK (unit_price >= 0),
ADD CONSTRAINT check_total_value_nonnegative CHECK (total_value IS NULL OR total_value >= 0);

-- Stock Loads
ALTER TABLE stock_load_items
ADD CONSTRAINT check_requested_quantity_positive CHECK (requested_quantity > 0),
ADD CONSTRAINT check_approved_quantity_nonnegative CHECK (approved_quantity IS NULL OR approved_quantity >= 0),
ADD CONSTRAINT check_released_quantity_nonnegative CHECK (released_quantity IS NULL OR released_quantity >= 0);

-- Journey Stops GPS
ALTER TABLE journey_stops
ADD CONSTRAINT check_checkin_lat_range CHECK (check_in_lat IS NULL OR (check_in_lat >= -90 AND check_in_lat <= 90)),
ADD CONSTRAINT check_checkin_lng_range CHECK (check_in_lng IS NULL OR (check_in_lng >= -180 AND check_in_lng <= 180));
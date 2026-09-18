-- Phase 15: Delivery Slot Selection
-- Add delivery_date and delivery_time_slot to orders table

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS delivery_time_slot VARCHAR(50);

-- Add Indian address fields to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_address2 TEXT,
  ADD COLUMN IF NOT EXISTS shipping_landmark TEXT,
  ADD COLUMN IF NOT EXISTS shipping_district TEXT,
  ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(6),
  ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(50) DEFAULT 'India';

-- Rename shipping_zip to shipping_pincode if it exists (safe approach: copy data)
UPDATE orders SET shipping_pincode = shipping_zip WHERE shipping_pincode IS NULL AND shipping_zip IS NOT NULL;

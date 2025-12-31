-- Add payment-related columns to orders table

ALTER TABLE orders ADD COLUMN payment_status TEXT;
ALTER TABLE orders ADD COLUMN payment_method TEXT;
ALTER TABLE orders ADD COLUMN razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN razorpay_payment_id TEXT;


-- Add printful_order_id column to orders table
-- This stores the Printful order ID for reference and tracking

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS printful_order_id INTEGER;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_printful_order_id ON public.orders(printful_order_id);

-- Comment for documentation
COMMENT ON COLUMN public.orders.printful_order_id IS 'Printful order ID for fulfillment tracking';

-- Modify products table to allow null seller_id
ALTER TABLE public.products ALTER COLUMN seller_id DROP NOT NULL;
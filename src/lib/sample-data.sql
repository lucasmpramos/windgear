-- First create the profile
INSERT INTO public.profiles (id, email, full_name, whatsapp, created_at)
VALUES (
  'acf6383e-2e10-4760-bbe7-787d08c9c485',
  'lucas.machado@example.com',
  'Lucas Machado',
  '+5511999999999',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  full_name = EXCLUDED.full_name,
  whatsapp = EXCLUDED.whatsapp;

-- Then add the products
INSERT INTO public.products 
(title, description, price, condition, category, images, seller_id, location, status)
VALUES
(
  'North Orbit 12m 2023 Kite',
  E'Perfect condition North Orbit 12m kite from 2023.\n\nFeatures:\n- Advanced 5-strut design\n- Excellent drift stability\n- Responsive steering\n- Includes kite bag\n\nOnly used for 5 sessions, selling because I''m switching sizes. No repairs or patches, like new condition.',
  1299.99,
  'used',
  'kites',
  ARRAY[
    'https://images.unsplash.com/photo-1621628669337-56bc3ed30d46?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1621186838282-c8602a24c27b?auto=format&fit=crop&q=80&w=1200'
  ],
  'acf6383e-2e10-4760-bbe7-787d08c9c485',
  'Miami, FL',
  'available'
);
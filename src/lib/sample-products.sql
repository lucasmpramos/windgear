-- First create the profile if it doesn't exist
INSERT INTO public.profiles (id, email, full_name, created_at)
VALUES (
  'acf6383e-2e10-4760-bbe7-787d08c9c485',
  'lucas.machado@example.com',
  'Lucas Machado',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name;

-- Get brand IDs
WITH brand_ids AS (
  SELECT id, name FROM brands
  WHERE name IN ('Core', 'Duotone', 'Mystic', 'North')
)

-- Then add the products with brand references and diverse images
INSERT INTO public.products 
(title, description, price, condition, category, brand_id, model, year, images, seller_id, location, status)
VALUES
(
  'Core XR7 12m Kite - Like New',
  E'Perfect condition Core XR7 12m kite from 2023.\n\nFeatures:\n- Advanced 5-strut design\n- Excellent drift stability\n- Responsive steering\n- Includes kite bag\n\nOnly used for 5 sessions, selling because I''m switching sizes. No repairs or patches, like new condition.',
  1299.99,
  'used',
  'kites',
  (SELECT id FROM brand_ids WHERE name = 'Core'),
  'XR7',
  2023,
  ARRAY[
    'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=1200&q=80',
    'https://images.unsplash.com/photo-1531251445707-1f000e1e87d0?w=1200&q=80',
    'https://images.unsplash.com/photo-1559288142-b1164bae7b62?w=1200&q=80'
  ],
  'acf6383e-2e10-4760-bbe7-787d08c9c485',
  'Miami, FL',
  'available'
),
(
  'Duotone Team Series 2023 Board',
  E'High-performance kiteboard in excellent condition.\n\nSpecs:\n- Length: 140cm\n- Width: 42cm\n- Comes with fins and straps\n- Carbon construction\n\nUsed for one season, great condition with minor base wear. Perfect for freestyle and freeride.',
  699.99,
  'used',
  'boards',
  (SELECT id FROM brand_ids WHERE name = 'Duotone'),
  'Team Series',
  2023,
  ARRAY[
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80',
    'https://images.unsplash.com/photo-1455264745730-cb3b76250ae8?w=1200&q=80'
  ],
  'acf6383e-2e10-4760-bbe7-787d08c9c485',
  'Miami, FL',
  'available'
),
(
  'Mystic Majestic X Harness 2023',
  E'Top-of-the-line harness in perfect condition.\n\nFeatures:\n- Size: Large\n- Carbon construction\n- Multi-point adjustment\n- Includes bar pad\n\nUsed only twice, selling due to size mismatch.',
  299.99,
  'used',
  'harnesses',
  (SELECT id FROM brand_ids WHERE name = 'Mystic'),
  'Majestic X',
  2023,
  ARRAY[
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&q=80',
    'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=1200&q=80',
    'https://images.unsplash.com/photo-1584496423548-7b0c55c92d11?w=1200&q=80'
  ],
  'acf6383e-2e10-4760-bbe7-787d08c9c485',
  'Miami, FL',
  'available'
),
(
  'North Orbit 12m 2023 Kite',
  E'Brand new North Orbit with 24m lines.\n\nIncludes:\n- Original bag\n- Repair kit\n- All original parts\n- Never used\n\nSelling because I received it as a gift but already have one.',
  1549.99,
  'new',
  'kites',
  (SELECT id FROM brand_ids WHERE name = 'North'),
  'Orbit',
  2023,
  ARRAY[
    'https://images.unsplash.com/photo-1517699418036-fb5d179fef0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1506310033436-6c87a0c49349?w=1200&q=80',
    'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=1200&q=80'
  ],
  'acf6383e-2e10-4760-bbe7-787d08c9c485',
  'Miami, FL',
  'available'
);
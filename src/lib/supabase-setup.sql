-- Modify products table to allow null seller_id
ALTER TABLE public.products ALTER COLUMN seller_id DROP NOT NULL;

-- Rename whatsapp column to phone if it exists
ALTER TABLE public.profiles 
  RENAME COLUMN whatsapp TO phone;

-- Update products status enum type
-- First drop the existing constraint
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;

-- Then add the new constraint with draft status
ALTER TABLE public.products ADD CONSTRAINT products_status_check 
  CHECK (status IN ('available', 'sold', 'reserved', 'draft'));

-- Drop existing models table if it exists
DROP TABLE IF EXISTS public.models CASCADE;

-- Create new models table with brand relation and slug
CREATE TABLE public.models_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  model_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE TABLE public.models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(brand_id, name),
  UNIQUE(brand_id, slug),
  CHECK (name <> '')
);

-- Create trigger function for model history tracking
CREATE OR REPLACE FUNCTION track_model_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO models_history (model_id, name, brand_id, operation)
    VALUES (OLD.id, OLD.name, OLD.brand_id, 'DELETE');
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO models_history (model_id, name, brand_id, operation)
    VALUES (NEW.id, NEW.name, NEW.brand_id, 'UPDATE');
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO models_history (model_id, name, brand_id, operation)
    VALUES (NEW.id, NEW.name, NEW.brand_id, 'INSERT');
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for model changes
CREATE TRIGGER track_model_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON models
FOR EACH ROW EXECUTE FUNCTION track_model_changes();

-- Add RLS policies
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON public.models FOR SELECT
  USING (true);

CREATE POLICY "Allow admin full access"
  ON public.models FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );
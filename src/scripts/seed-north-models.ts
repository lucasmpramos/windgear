import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const northKiteModels = [
  // Standard models
  'Orbit',
  'Reach',
  'Pulse',
  'Carve',
  'Mono',
  // Legacy models
  'Rebel',
  'Evo',
  'Neo',
  'Dice',
  'Vegas',
  // Performance variants
  'Orbit TR',
  'Reach TR',
  'Pulse TR'
];

async function seedNorthModels() {
  try {
    console.log('Starting to seed North kite models...');
    
    // First, get the North brand ID
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('name', 'North')
      .single();

    if (brandError) throw brandError;
    if (!brand) throw new Error('North brand not found');

    const brandId = brand.id;
    console.log('Found North brand ID:', brandId);

    // Prepare model data
    const modelData = northKiteModels.map(name => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand_id: brandId
    }));

    // Insert models
    const { data, error } = await supabase
      .from('models')
      .upsert(modelData, { 
        onConflict: 'brand_id,name',
        ignoreDuplicates: true 
      })
      .select();

    if (error) throw error;

    console.log('Successfully added North kite models:', data?.length);
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding North models:', error);
    process.exit(1);
  }
}

seedNorthModels();
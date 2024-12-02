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

const duotoneKiteModels = [
  // Standard models
  'Evo',
  'Neo',
  'Dice',
  'Rebel',
  'Vegas',
  'Juice',
  'Mono',
  'Echo',
  'Unit',
  'Capa',
  // SLS Variants
  'Evo SLS',
  'Neo SLS', 
  'Dice SLS',
  'Rebel SLS',
  'Vegas SLS',
  'Unit SLS',
  // D/Lab Variants
  'Evo D/Lab',
  'Neo D/Lab',
  'Dice D/Lab',
  'Rebel D/Lab'
];

async function seedDuotoneModels() {
  try {
    console.log('Starting to seed Duotone kite models...');
    
    // First, get the Duotone brand ID
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('name', 'Duotone')
      .single();

    if (brandError) throw brandError;
    if (!brand) throw new Error('Duotone brand not found');

    const brandId = brand.id;
    console.log('Found Duotone brand ID:', brandId);

    // Prepare model data
    const modelData = duotoneKiteModels.map(name => ({
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

    console.log('Successfully added Duotone kite models:', data?.length);
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding Duotone models:', error);
    process.exit(1);
  }
}

seedDuotoneModels();
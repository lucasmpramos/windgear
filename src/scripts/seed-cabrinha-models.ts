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

const cabrinhaKiteModels = [
  // Standard models
  'Switchblade',
  'Moto',
  'Contra',
  'Drifter',
  'Apollo',
  'AV8',
  'XO',
  // Legacy models
  'FX',
  'Chaos',
  'Vector',
  'Crossbow'
];

async function seedCabrinhaModels() {
  try {
    console.log('Starting to seed Cabrinha kite models...');
    
    // First, get the Cabrinha brand ID
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('name', 'Cabrinha')
      .single();

    if (brandError) throw brandError;
    if (!brand) throw new Error('Cabrinha brand not found');

    const brandId = brand.id;
    console.log('Found Cabrinha brand ID:', brandId);

    // Prepare model data
    const modelData = cabrinhaKiteModels.map(name => ({
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

    console.log('Successfully added Cabrinha kite models:', data?.length);
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding Cabrinha models:', error);
    process.exit(1);
  }
}

seedCabrinhaModels();
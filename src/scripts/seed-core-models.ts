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

const coreKiteModels = [
  // Standard models
  'XR',
  'Nexus',
  'GTS',
  'Section',
  'Free',
  'Impact',
  'Choice',
  // LW Variants
  'XR LW',
  'Nexus LW',
  'GTS LW',
  // X-Series
  'XR X',
  'Nexus X',
  'GTS X'
];

async function seedCoreModels() {
  try {
    console.log('Starting to seed Core kite models...');
    
    // First, get the Core brand ID
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('name', 'Core')
      .single();

    if (brandError) throw brandError;
    if (!brand) throw new Error('Core brand not found');

    const brandId = brand.id;
    console.log('Found Core brand ID:', brandId);

    // Prepare model data
    const modelData = coreKiteModels.map(name => ({
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

    console.log('Successfully added Core kite models:', data?.length);
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding Core models:', error);
    process.exit(1);
  }
}

seedCoreModels();
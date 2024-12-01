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

const categories = [
  { name: 'Kites', slug: 'kites' },
  { name: 'Boards', slug: 'boards' },
  { name: 'Harnesses', slug: 'harnesses' },
  { name: 'Bars', slug: 'bars' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Wetsuits', slug: 'wetsuits' }
];

async function seedCategories() {
  try {
    console.log('Starting to seed categories...');
    
    // First, delete existing categories
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      throw deleteError;
    }
    console.log('Cleared existing categories');
    
    // Insert new categories
    const { data, error } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (error) {
      throw error;
    }

    console.log('Successfully added categories:', data.length);
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
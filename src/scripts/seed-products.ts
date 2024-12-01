import { supabase } from '../lib/supabase';

const sampleProducts = [
  {
    title: 'Core XR7 12m Kite - Like New',
    description: 'Excellent condition Core XR7 12m kite from this season.\n\nFeatures:\n- Powerful, stable design\n- Great for freeride and big air\n- Includes kite bag and repair kit\n- No repairs or patches\n\nOnly used for 3 sessions, selling because I\'m switching sizes.',
    price: 1199.99,
    condition: 'used',
    category: 'kites',
    images: [
      'https://images.pexels.com/photos/1604746/pexels-photo-1604746.jpeg',
      'https://images.pexels.com/photos/1604747/pexels-photo-1604747.jpeg'
    ],
    seller_id: 'acf6383e-2e10-4760-bbe7-787d08c9c485',
    location: 'Miami Beach, FL',
    status: 'available'
  },
  {
    title: 'Cabrinha Stylus 142cm Twintip',
    description: 'Perfect freeride board for intermediate to advanced riders.\n\nSpecs:\n- Length: 142cm\n- Width: 43cm\n- Includes fins and straps\n- Progressive/Continuous Rocker\n\nUsed for one season, great condition with minor base wear.',
    price: 449.99,
    condition: 'used',
    category: 'boards',
    images: [
      'https://images.pexels.com/photos/1604746/pexels-photo-1604746.jpeg',
      'https://images.pexels.com/photos/1604747/pexels-photo-1604747.jpeg'
    ],
    seller_id: 'acf6383e-2e10-4760-bbe7-787d08c9c485',
    location: 'Miami Beach, FL',
    status: 'available'
  },
  {
    title: 'Mystic Majestic X Harness 2023',
    description: 'Top-of-the-line harness in perfect condition.\n\nFeatures:\n- Size: Large\n- Carbon construction\n- Multi-point adjustment\n- Includes bar pad\n\nUsed only twice, selling due to size mismatch.',
    price: 299.99,
    condition: 'used',
    category: 'harnesses',
    images: [
      'https://images.pexels.com/photos/1604746/pexels-photo-1604746.jpeg',
      'https://images.pexels.com/photos/1604747/pexels-photo-1604747.jpeg'
    ],
    seller_id: 'acf6383e-2e10-4760-bbe7-787d08c9c485',
    location: 'Miami Beach, FL',
    status: 'available'
  },
  {
    title: 'Duotone Click Bar 2023 - 24m Lines',
    description: 'Brand new Click Bar with 24m lines.\n\nIncludes:\n- Original bag\n- Safety leash\n- All original parts\n- Unused chicken loop\n\nNever used, selling because I received it as a gift but already have one.',
    price: 549.99,
    condition: 'new',
    category: 'bars',
    images: [
      'https://images.pexels.com/photos/1604746/pexels-photo-1604746.jpeg',
      'https://images.pexels.com/photos/1604747/pexels-photo-1604747.jpeg'
    ],
    seller_id: 'acf6383e-2e10-4760-bbe7-787d08c9c485',
    location: 'Miami Beach, FL',
    status: 'available'
  }
];

async function seedProducts() {
  try {
    console.log('Starting to seed products...');
    
    // First, delete existing products for this seller
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('seller_id', 'acf6383e-2e10-4760-bbe7-787d08c9c485');

    if (deleteError) {
      throw deleteError;
    }
    
    // Insert new products
    const { data, error } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();

    if (error) {
      throw error;
    }

    console.log('Successfully added products:', data.length);
    
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

seedProducts();
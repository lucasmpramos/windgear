export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  is_admin?: boolean;
  last_sign_in_at?: string;
}

export type ProductCategory = 'kites' | 'boards' | 'harnesses' | 'bars' | 'accessories' | 'wetsuits';

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  website?: string;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: 'new' | 'used';
  category: ProductCategory;
  images: string[];
  seller_id: string;
  location: string;
  status: 'available' | 'sold' | 'reserved' | 'draft';
  brand_id?: string;
  brand?: Brand;
  model?: string;
  year?: number;
  views: number;
  created_at: string;
  updated_at?: string;
  seller?: User;
  reviews: any[];
  saved_items: any[];
  averageRating?: number;
  isSaved?: boolean;
}

export interface SavedItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}
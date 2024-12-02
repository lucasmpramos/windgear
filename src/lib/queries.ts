import { supabase } from './supabase';
import type { Database } from './database.types';
import toast from 'react-hot-toast';
import { handleError, AppError, ErrorType, ErrorSeverity } from '../utils/errorHandler'; 

type Product = Database['public']['Tables']['products']['Row'];
type SavedItem = Database['public']['Tables']['saved_items']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Model = Database['public']['Tables']['models']['Row'];

export async function getBrandModels(brandId: string): Promise<Model[]> {
  return retryOperation(async () => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('brand_id', brandId)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(new AppError('Failed to fetch brand models', {
        type: ErrorType.DATABASE,
        severity: ErrorSeverity.HIGH,
        context: { brandId, error },
        displayMessage: 'Unable to load models. Please try again.'
      }));
      return [];
    }
  });
}

export async function getCategories() {
  return retryOperation(async () => {
    try {
      // Return static categories with translation keys
      const categories = [
        { id: 'kites', translationKey: 'products.categories.kites' },
        { id: 'boards', translationKey: 'products.categories.boards' },
        { id: 'harnesses', translationKey: 'products.categories.harnesses' },
        { id: 'bars', translationKey: 'products.categories.bars' },
        { id: 'accessories', translationKey: 'products.categories.accessories' },
        { id: 'wetsuits', translationKey: 'products.categories.wetsuits' }
      ];
      
      return categories;
    } catch (error) {
      handleError(new AppError('Failed to fetch categories', {
        type: ErrorType.DATABASE,
        severity: ErrorSeverity.HIGH,
        context: { error },
        displayMessage: 'Unable to load categories. Please try again.'
      }));
      return [];
    }
  });
}

interface ProductFilters {
  category?: string;
  condition?: 'new' | 'used';
  status?: 'active' | 'draft';
  adminSearch?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sellerId?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && (error.code === 'ECONNRESET' || error.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries)));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
}

export async function getProducts(filters?: ProductFilters) {
  return retryOperation(async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:profiles(*),
          brand:brands(
            *,
            models(*)
          ),
          reviews(*),
          saved_items(*)
        `);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
      }
      if (filters?.sellerId) {
        query = query.eq('seller_id', filters.sellerId);
      }

      // Status filtering
      if (filters?.status === 'draft') {
        query = query.eq('status', 'draft');
      } else if (filters?.status === 'active') {
        query = query.neq('status', 'draft');
      } else if (!filters?.adminSearch) {
        // By default, exclude draft products
        query = query.neq('status', 'draft');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(product => ({
        ...product,
        averageRating: product.reviews.length
          ? product.reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / product.reviews.length
          : null,
        isSaved: product.saved_items.length > 0
      }));
    } catch (error) {
      handleError(new AppError('Failed to fetch products', {
        type: ErrorType.DATABASE, 
        severity: ErrorSeverity.HIGH,
        context: { filters, error },
        displayMessage: 'Unable to load products. Please try again.'
      }));
      return [];
    }
  });
}

export async function getProduct(id: string, incrementViews: boolean = true) {
  return retryOperation(async () => {
    try {
      // First get the product data
      const { data, error } = await supabase
        .from('products') 
        .select(`
          *,
          seller:profiles(*),
          brand:brands(
            *,
            models(*)
          ),
          reviews(
            *,
            user:profiles(*)
          ),
          saved_items(*)
        `)
        .eq('id', id)  // Allow viewing draft products directly
        .single();

      if (error) throw error;

      // Increment views if requested
      if (incrementViews) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);

        if (updateError) {
          console.error('Error incrementing views:', updateError);
        }
      }

      return {
        ...data,
        views: incrementViews ? (data.views || 0) + 1 : (data.views || 0),
        averageRating: data.reviews.length
          ? data.reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / data.reviews.length
          : null,
        isSaved: data.saved_items.length > 0
      };
    } catch (error) {
      throw new AppError('Failed to fetch product details', {
        type: ErrorType.DATABASE,
        severity: ErrorSeverity.HIGH,
        context: { productId: id },
        displayMessage: 'Unable to load product details. Please try again.'
      });
    }
  });
}

export async function getSavedItems(userId: string) {
  return retryOperation(async () => {
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select(`
          *,
          product:products(
            *,
            seller:profiles(*),
            brand:brands(*),
            reviews(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        ...item.product,
        averageRating: item.product.reviews.length
          ? item.product.reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / item.product.reviews.length
          : null,
        isSaved: true
      }));
    } catch (error) {
      console.error('Error fetching saved items:', error);
      throw error;
    }
  });
}

export async function toggleSavedItem(userId: string, productId: string): Promise<boolean> {
  return retryOperation(async () => {
    try {
      // Check if item is already saved
      const { data: existingSave } = await supabase
        .from('saved_items')
        .select()
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existingSave) {
        // Remove from saved items
        const { error } = await supabase
          .from('saved_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) throw error;
        return false; // Item was unsaved
      } else {
        // Add to saved items
        const { error } = await supabase
          .from('saved_items')
          .insert({ user_id: userId, product_id: productId });

        if (error) throw error;
        return true; // Item was saved
      }
    } catch (error) {
      console.error('Error toggling saved item:', error);
      throw error;
    }
  });
}

export async function deleteProduct(productId: string, userId: string) {
  return retryOperation(async () => {
    try {
      // If userId is 'admin', skip permission check
      let isAdmin = false;
      if (userId !== 'admin') {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .single();

        if (profileError) {
          throw new AppError('Failed to verify user permissions', {
            type: ErrorType.AUTH,
            severity: ErrorSeverity.HIGH,
            context: { userId, productId },
            displayMessage: 'Failed to verify permissions. Please try again.'
          });
        }
        isAdmin = profile?.is_admin || false;
      } else {
        isAdmin = true;
      }

      // First delete all saved_items references
      const { error: savedItemsError } = await supabase
        .from('saved_items')
        .delete()
        .eq('product_id', productId);

      if (savedItemsError) {
        throw new AppError('Failed to remove saved items references', {
          type: ErrorType.DATABASE,
          severity: ErrorSeverity.HIGH,
          context: { productId },
          displayMessage: 'Failed to delete product. Please try again.'
        });
      }

      // Then delete the product itself
      const deleteQuery = supabase
        .from('products')
        .delete()
        .eq('id', productId);

      // Only add seller_id check if not admin 
      if (!isAdmin) {
        deleteQuery.eq('seller_id', userId);
      }

      const { error: productError } = await deleteQuery;

      if (productError) {
        throw new AppError('Failed to delete product', {
          type: ErrorType.DATABASE,
          severity: ErrorSeverity.HIGH,
          context: { productId, error: productError },
          displayMessage: 'Failed to delete product. Please try again.'
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete product', {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.HIGH,
        context: { productId, error },
        displayMessage: 'Failed to delete product. Please try again.'
      });
    }
  });
}

export async function updateProductStatus(productId: string, status: 'available' | 'sold' | 'reserved') {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', productId);

    if (error) {
      console.error('Error updating product status:', error);
      throw error;
    }
  });
}
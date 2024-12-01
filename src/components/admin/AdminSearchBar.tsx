import React, { useState, useRef } from 'react';
import { Search, Loader, Shield } from 'lucide-react';
import { Product, User as UserType } from '../../types';
import { supabase } from '../../lib/supabase';
import { getProducts } from '../../lib/queries';
import { useClickOutside } from '../../hooks/useClickOutside';
import ImageComponent from '../ImageComponent';
import Avatar from '../Avatar';
import debounce from '../../utils/debounce';
import classNames from 'classnames';
import EditUserModal from '../EditUserModal';
import EditProductModal from './EditProductModal';

interface AdminSearchBarProps {
  className?: string;
  onUserUpdate?: (user: UserType) => void;
  onProductUpdate?: (product: Product) => void;
}

type SearchResult = {
  type: 'product' | 'user';
  data: Product | UserType;
};

function AdminSearchBar({ className = '', onUserUpdate, onProductUpdate }: AdminSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useClickOutside(searchRef, () => setShowResults(false));

  const searchProducts = async (searchQuery: string) => {
    try {
      const products = await getProducts({ search: searchQuery });
      return products.slice(0, 5).map(product => ({
        type: 'product' as const,
        data: product
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  const searchUsers = async (searchQuery: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5);

      if (error) throw error;

      return data.map(user => ({
        type: 'user' as const,
        data: user
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const handleSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [productResults, userResults] = await Promise.all([
        searchProducts(searchQuery),
        searchUsers(searchQuery)
      ]);

      setResults([...productResults, ...userResults]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleUserUpdate = (updatedUser: UserType) => {
    setResults(prev => prev.map(result => 
      result.type === 'user' && result.data.id === updatedUser.id
        ? { ...result, data: updatedUser }
        : result
    ));
    onUserUpdate?.(updatedUser);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    setResults(prev => prev.map(result => 
      result.type === 'product' && result.data.id === updatedProduct.id
        ? { ...result, data: updatedProduct }
        : result
    ));
    onProductUpdate?.(updatedProduct);
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    if (result.type === 'product') {
      setEditingProduct(result.data as Product);
    } else {
      setEditingUser(result.data as UserType);
    }
  };

  const renderResult = (result: SearchResult) => {
    if (result.type === 'product') {
      const product = result.data as Product;
      return (
        <button
          onClick={() => handleResultClick(result)}
          className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg text-left"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <ImageComponent
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600">
                {product.brand?.name}
              </span>
              {product.model && (
                <span className="text-sm text-gray-600">
                  {product.model}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-900 truncate">{product.title}</p>
            <p className="text-sm text-gray-500">${product.price.toLocaleString()}</p>
          </div>
        </button>
      );
    } else {
      const user = result.data as UserType;
      return (
        <button
          onClick={() => handleResultClick(result)}
          className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg text-left"
        >
          <Avatar
            src={user.avatar_url}
            alt={user.full_name || 'User'}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {user.full_name || 'Anonymous User'}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.is_admin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>
        </button>
      );
    }
  };

  return (
    <>
      <div ref={searchRef} className={classNames('relative', className)}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search products or users..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {showResults && (query || results.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[60vh] overflow-y-auto z-50">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => (
                  <div key={`${result.type}-${result.data.id}`}>
                    {index > 0 && <div className="border-t border-gray-100 my-1" />}
                    {renderResult(result)}
                  </div>
                ))}
              </div>
            ) : query && (
              <div className="p-4 text-center text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          onProductUpdate={handleProductUpdate}
        />
      )}
    </>
  );
}

export default AdminSearchBar;
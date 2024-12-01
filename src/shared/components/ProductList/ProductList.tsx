import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Loader, AlertCircle, ChevronDown } from 'lucide-react';
import { Product } from '../../../types';
import ProductCard from '../ProductCard';
import classNames from 'classnames';
import { Menu } from '@headlessui/react';

export interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  gridCols?: 2 | 3 | 4;
  showViewToggle?: boolean;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  size?: 'sm' | 'md';
  onSaveChange?: (productId: string, saved: boolean) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'products.sort.newest' },
  { value: 'oldest', label: 'products.sort.oldest' },
  { value: 'price-asc', label: 'products.sort.priceLowHigh' },
  { value: 'price-desc', label: 'products.sort.priceHighLow' }
];

function ProductList({
  products,
  loading = false,
  error = null,
  emptyMessage = 'No products found',
  viewMode = 'grid',
  onViewModeChange,
  gridCols = 3,
  showViewToggle = true,
  sortValue = 'newest',
  onSortChange,
  size = 'md',
  onSaveChange,
  className = ''
}: ProductListProps) {
  const { t } = useTranslation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4'
  };

  // Handle view mode change with animation
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (mode === viewMode || !onViewModeChange) return;
    setIsTransitioning(true);
    setTimeout(() => {
      onViewModeChange(mode);
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 150);
  };

  // Grid columns configuration
  const gridColsClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Controls Bar */}
      <div className="flex items-center justify-end gap-4 mb-4">
        {/* Sort Dropdown */}
        {onSortChange && (
          <Menu as="div" className="relative">
            <Menu.Button
              className={classNames(
                "flex items-center gap-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition",
                sizeClasses[size]
              )}
            >
              <span className="text-gray-900">{t('common.sortBy')}</span>
              <ChevronDown className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
            </Menu.Button>
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              {SORT_OPTIONS.map(({ value, label }) => (
                <Menu.Item key={value}>
                  {({ active }) => (
                    <button
                      onClick={() => onSortChange(value)}
                      className={classNames(
                        'w-full text-left px-4 py-2',
                        size === 'sm' ? 'text-sm' : 'text-base',
                        active ? 'bg-gray-50 text-blue-600' : 'text-gray-700'
                      )}
                    >
                      {t(label)}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
        )}

        {/* View Toggle */}
        {showViewToggle && onViewModeChange && (
          <div className="hidden md:flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={classNames(
                'p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:text-blue-600'
              )}
              title={t('common.gridView')}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={classNames(
                'p-2 transition-colors border-l border-gray-200',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:text-blue-600'
              )}
              title={t('common.listView')}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      <div
        className={classNames(
          'transition-opacity duration-150 ease-in-out',
          isTransitioning ? 'opacity-0' : 'opacity-100'
        )}
      >
        {viewMode === 'grid' ? (
          <div className={classNames(
            'grid grid-cols-1 gap-4',
            gridColsClasses[gridCols]
          )}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="grid"
                onSaveChange={onSaveChange ? (saved) => onSaveChange(product.id, saved) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="list"
                onSaveChange={onSaveChange ? (saved) => onSaveChange(product.id, saved) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
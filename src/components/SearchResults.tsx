import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Product, ProductCategory } from '../types';
import { Tag, Loader } from 'lucide-react';
import ImageComponent from './ImageComponent';
import ConditionBadge from './ConditionBadge';
import classNames from 'classnames';

interface SearchResultsProps {
  query: string;
  products: Product[];
  categories: ProductCategory[];
  loading: boolean;
  onClose: () => void;
  showSearch?: boolean;
}

function SearchResults({ query, products, categories, loading, onClose, showSearch }: SearchResultsProps) {
  const { t } = useTranslation();
  if (!query && products.length === 0) return null;

  return (
    <div className={classNames(
      "bg-white rounded-lg",
      !showSearch && "absolute top-full left-0 right-0 mt-2 shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto"
    )}>
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">{t('common.categories')}</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/products?category=${category}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-xs md:text-sm text-gray-700 hover:bg-gray-200"
                  >
                    <Tag className="h-4 w-4" />
                    <span className="capitalize">{category}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {products.length > 0 ? (
            <div className="p-2">
              <div className="grid grid-cols-1 gap-2">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-2 md:gap-4 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageComponent
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 md:gap-2 mb-0.5">
                        <span className="text-xs md:text-sm font-medium text-blue-600">
                          {product.brand?.name}
                        </span>
                        {product.model && (
                          <span className="text-xs md:text-sm text-gray-600">
                            {product.model}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {product.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs md:text-sm text-gray-900">
                          ${product.price.toLocaleString()}
                        </span>
                        <ConditionBadge condition={product.condition} size="sm" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : query && !loading && (
            <div className="p-4 text-center text-gray-500">
              {t('common.noResults')} "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search } from 'lucide-react';
import { Brand } from '../types';
import classNames from 'classnames';

interface ActiveFiltersProps {
  filters: {
    categories: string[];
    conditions: string[];
    brands: string[];
    minPrice: number;
    maxPrice: number;
    minYear: number;
    maxYear: number;
    sort: string;
  };
  searchQuery?: string;
  brands: Brand[];
  onRemoveFilter: (type: string, value: string) => void;
  onClearFilters: () => void;
  onClearSearch?: () => void;
  className?: string;
}

export default function ActiveFilters({
  filters,
  searchQuery,
  brands,
  onRemoveFilter,
  onClearFilters,
  onClearSearch,
  className = ''
}: ActiveFiltersProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const hasActiveFilters = filters.categories.length > 0 || 
    filters.conditions.length > 0 || 
    filters.brands.length > 0 ||
    filters.minPrice !== 0 ||
    filters.maxPrice !== 30000 ||
    filters.minYear !== currentYear - 10 ||
    filters.maxYear !== currentYear + 1 ||
    searchQuery;

  if (!hasActiveFilters) return null;

  return (
    <div className={classNames("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm text-gray-600">
        {t('common.filteringBy')}:
      </span>
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {searchQuery && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">
            <Search className="h-3 w-3" />
            <span>{searchQuery}</span>
            <button
              onClick={onClearSearch}
              className="p-0.5 hover:bg-purple-200 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        {filters.categories.map((category) => (
          <span
            key={category}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
          >
            <span>{t(`products.categories.${category}`)}</span>
            <button
              onClick={() => onRemoveFilter('category', category)}
              className="p-0.5 hover:bg-blue-200 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {filters.conditions.map((condition) => (
          <span
            key={condition}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm"
          >
            <span>{t(`products.conditions.${condition}`)}</span>
            <button
              onClick={() => onRemoveFilter('condition', condition)}
              className="p-0.5 hover:bg-green-200 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {filters.brands.map((brandId) => {
          const brand = brands.find(b => b.id === brandId);
          if (!brand) return null;
          return (
            <span
              key={brandId}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-sm"
            >
              {brand.name}
              <button
                onClick={() => onRemoveFilter('brand', brandId)}
                className="p-0.5 hover:bg-purple-200 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}

        {(filters.minPrice !== 0 || filters.maxPrice !== 30000) && (
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-sm"
          >
            ${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}
            <button
              onClick={() => onRemoveFilter('price', '')}
              className="p-0.5 hover:bg-orange-200 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {(filters.minYear !== currentYear - 10 || filters.maxYear !== currentYear + 1) && (
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm"
          >
            {filters.minYear} - {filters.maxYear}
            <button
              onClick={() => onRemoveFilter('year', '')}
              className="p-0.5 hover:bg-yellow-200 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

      </div>
      <button
        onClick={onClearFilters}
        className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
      >
        {t('common.clearFilters')}
      </button>
    </div>
  );
}
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, ChevronDown } from 'lucide-react';
import { ProductCategory, Brand } from '../types';
import classNames from 'classnames';
import Combobox from '../shared/components/Combobox';
import RangeSlider from 'react-range-slider-input'; 
import 'react-range-slider-input/dist/style.css';

interface FilterState {
  categories: string[];
  conditions: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  sort: string;
}

interface SearchFiltersProps {
  filters: FilterState;
  brands: Brand[];
  onChange: (filters: FilterState) => void;
  className?: string;
}

const categories: ProductCategory[] = [
  'kites',
  'boards',
  'harnesses',
  'bars',
  'accessories',
  'wetsuits'
];

const currentYear = new Date().getFullYear();

export default function SearchFilters({ filters, brands, onChange, className = '' }: SearchFiltersProps) {
  const { t } = useTranslation();
  const handleSortChange = (value: string) => {
    onChange({ ...filters, sort: value });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: newCategories });
  };

  const handleConditionToggle = (condition: string) => {
    const newConditions = filters.conditions.includes(condition)
      ? filters.conditions.filter(c => c !== condition)
      : [...filters.conditions, condition];
    onChange({ ...filters, conditions: newConditions });
  };

  const handleBrandToggle = (brandId: string) => {
    const newBrands = filters.brands.includes(brandId)
      ? filters.brands.filter(b => b !== brandId)
      : [...filters.brands, brandId];
    onChange({ ...filters, brands: newBrands });
  };

  const handlePriceChange = (values: number[]) => {
    onChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1]
    });
  };

  const handleYearChange = (values: number[]) => {
    onChange({
      ...filters,
      minYear: values[0],
      maxYear: values[1]
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-2 md:mb-3">{t('common.category')}</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={classNames(
                'px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium border',
                filters.categories.includes(category)
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              )}
            >
              <span>{t(`products.categories.${category}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-2 md:mb-3">{t('common.condition')}</h3>
        <div className="flex flex-wrap gap-2">
          {['new', 'used'].map((condition) => (
            <button
              key={condition}
              onClick={() => handleConditionToggle(condition)}
              className={classNames(
                'px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium border',
                filters.conditions.includes(condition)
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              )}
            >
              <span>{t(`products.conditions.${condition}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Year Range */}
      <div>
        <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-2 md:mb-3">{t('common.year')}</h3>
        <div className="px-2">
          <RangeSlider
            min={currentYear - 10}
            max={currentYear + 1}
            step={1}
            value={[filters.minYear, filters.maxYear]}
            onInput={handleYearChange}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs md:text-sm text-gray-600">{filters.minYear}</span>
            <span className="text-xs md:text-sm text-gray-600">{filters.maxYear}</span>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-2 md:mb-3">{t('common.priceRange')}</h3>
        <div className="px-2">
          <RangeSlider
            min={0}
            max={30000}
            step={100}
            value={[filters.minPrice, filters.maxPrice]}
            onInput={handlePriceChange}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs md:text-sm text-gray-600">${filters.minPrice.toLocaleString()}</span>
            <span className="text-xs md:text-sm text-gray-600">${filters.maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-2 md:mb-3">{t('common.brands')}</h3>
        <Combobox
          options={brands}
          selectedIds={filters.brands}
          onChange={(brandIds) => onChange({ ...filters, brands: brandIds })}
          placeholder={t('common.selectBrands')}
        />
      </div>
    </div>
  );
}
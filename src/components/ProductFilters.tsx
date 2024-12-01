import React from 'react';
import { Filter } from 'lucide-react';
import { ProductCategory } from '../types';

interface FilterState {
  categories?: string[];
  conditions?: string[];
  minPrice?: number;
  maxPrice?: number;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  const categories: ProductCategory[] = [
    'kites',
    'boards',
    'harnesses',
    'bars',
    'accessories',
    'wetsuits'
  ];

  const maxPriceLimit = 3000;
  const [priceRange, setPriceRange] = React.useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || maxPriceLimit
  });

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    const newRange = {
      ...priceRange,
      [type]: numValue
    };

    if (type === 'min' && numValue > priceRange.max) {
      newRange.min = priceRange.max;
    } else if (type === 'max' && numValue < priceRange.min) {
      newRange.max = priceRange.min;
    }

    setPriceRange(newRange);
    onFilterChange({
      ...filters,
      minPrice: newRange.min,
      maxPrice: newRange.max
    });
  };

  const handleCategoryChange = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onFilterChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined
    });
  };

  const handleConditionChange = (condition: string) => {
    const currentConditions = filters.conditions || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    
    onFilterChange({
      ...filters,
      conditions: newConditions.length > 0 ? newConditions : undefined
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.categories?.includes(category) || false}
                onChange={() => handleCategoryChange(category)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Condition</h3>
        <div className="space-y-2">
          {['new', 'used'].map((condition) => (
            <label key={condition} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.conditions?.includes(condition) || false}
                onChange={() => handleConditionChange(condition)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">$0</span>
              <span className="text-blue-600 font-medium">
                ${priceRange.min} - ${priceRange.max}
              </span>
              <span className="text-gray-600">${maxPriceLimit}</span>
            </div>
            <div className="relative pt-1">
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="absolute w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="absolute w-full h-1 bg-transparent rounded appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                max={priceRange.max}
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min={priceRange.min}
                max={maxPriceLimit}
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setPriceRange({ min: 0, max: maxPriceLimit });
          onFilterChange({});
        }}
        className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Clear Filters
      </button>
    </div>
  );
}

export default ProductFilters;
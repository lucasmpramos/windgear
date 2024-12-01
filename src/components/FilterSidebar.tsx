import React from 'react';
import { X } from 'lucide-react';
import { ProductCategory } from '../types';

interface FilterSidebarProps {
  show: boolean;
  onClose: () => void;
}

function FilterSidebar({ show, onClose }: FilterSidebarProps) {
  const categories: ProductCategory[] = [
    'kites',
    'boards',
    'harnesses',
    'bars',
    'accessories',
    'wetsuits'
  ];

  const conditions = ['new', 'used'];
  const priceRanges = [
    { label: 'Under $500', value: '0-500' },
    { label: '$500 - $1000', value: '500-1000' },
    { label: '$1000 - $2000', value: '1000-2000' },
    { label: 'Over $2000', value: '2000+' }
  ];

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300
        ${show ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:transform-none md:block md:w-64
      `}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="space-y-3">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="ml-2 text-gray-700 capitalize">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Condition</h3>
          <div className="space-y-3">
            {conditions.map((condition) => (
              <label key={condition} className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="ml-2 text-gray-700 capitalize">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Price Range</h3>
          <div className="space-y-3">
            {priceRanges.map((range) => (
              <label key={range.value} className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="ml-2 text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply Filters Button */}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default FilterSidebar;
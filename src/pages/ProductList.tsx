import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../lib/queries';
import { Product, Brand, ProductCategory } from '../types';
import ProductList from '../shared/components/ProductList';
import SearchBar from '../shared/components/SearchBar';
import SearchFilters from '../components/SearchFilters';
import ActiveFilters from '../components/ActiveFilters';
import ResultsCounter from '../shared/components/ResultsCounter';
import { Loader, Filter, X, LayoutGrid, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import classNames from 'classnames';

const currentYear = new Date().getFullYear();

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return window.innerWidth >= 768 ? 'grid' : 'list';
  });

  const [filters, setFilters] = useState({
    categories: searchParams.getAll('category'),
    conditions: searchParams.getAll('condition'),
    brands: searchParams.getAll('brand'),
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 30000,
    minYear: Number(searchParams.get('minYear')) || currentYear - 10,
    maxYear: Number(searchParams.get('maxYear')) || currentYear + 1,
    sort: searchParams.get('sort') || 'newest'
  });

  // Fetch brands
  useEffect(() => {
    async function fetchBrands() {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setBrands(data);
      } catch (err) {
        console.error('Error fetching brands:', err);
      }
    }
    fetchBrands();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    filters.categories.forEach(category => params.append('category', category));
    filters.conditions.forEach(condition => params.append('condition', condition));
    filters.brands.forEach(brand => params.append('brand', brand));
    
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 30000) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minYear > currentYear - 10) params.set('minYear', filters.minYear.toString());
    if (filters.maxYear < currentYear + 1) params.set('maxYear', filters.maxYear.toString());
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    if (searchQuery) params.set('search', searchQuery);
    
    setSearchParams(params);
  }, [filters, searchQuery, setSearchParams]);

  // Fetch and filter products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts({
          search: searchQuery
        });

        // Client-side filtering
        const filteredData = data.filter(product => {
          // If no filters are selected in a category, treat it as "all selected"
          const categoryMatch = filters.categories.length === 0 || filters.categories.includes(product.category);
          const conditionMatch = filters.conditions.length === 0 || filters.conditions.includes(product.condition);
          const brandMatch = filters.brands.length === 0 || filters.brands.includes(product.brand_id || '');
          
          const yearMatch = (!product.year || (
            product.year >= filters.minYear &&
            product.year <= filters.maxYear
          ));

          const priceMatch = (
            product.price >= filters.minPrice &&
            product.price <= filters.maxPrice
          );

          return categoryMatch && conditionMatch && brandMatch && yearMatch && priceMatch;
        });

        // Sort products
        const sortedData = [...filteredData].sort((a, b) => {
          switch (filters.sort) {
            case 'price-asc':
              return a.price - b.price;
            case 'price-desc':
              return b.price - a.price;
            case 'oldest':
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'newest':
            default:
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
        });

        setProducts(sortedData);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, searchQuery]);

  // Force grid view on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setViewMode('grid');
      } else {
        setViewMode('list');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const handleRemoveFilter = (type: string, value: string) => {
    switch (type) {
      case 'category':
        setFilters(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c !== value)
        }));
        break;
      case 'condition':
        setFilters(prev => ({
          ...prev,
          conditions: prev.conditions.filter(c => c !== value)
        }));
        break;
      case 'brand':
        setFilters(prev => ({
          ...prev,
          brands: prev.brands.filter(b => b !== value)
        }));
        break;
      case 'price':
        setFilters(prev => ({
          ...prev,
          minPrice: 0,
          maxPrice: 30000
        }));
        break;
      case 'year':
        setFilters(prev => ({
          ...prev,
          minYear: currentYear - 10,
          maxYear: currentYear + 1
        }));
        break;
    }
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      conditions: [],
      brands: [],
      minPrice: 0,
      maxPrice: 30000,
      minYear: currentYear - 10,
      maxYear: currentYear + 1,
      sort: 'newest'
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Filters Sidebar */}
        <div className={classNames(
          'fixed top-16 bottom-0 left-0 right-0 z-40 bg-white md:static md:bg-transparent md:z-0',
          'w-full md:w-64 flex-shrink-0',
          showFilters ? 'block' : 'hidden md:block'
        )}>
          {/* Mobile Filter Header */}
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <h2 className="text-base font-semibold">Filters</h2>
            <button onClick={() => setShowFilters(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="h-[calc(100%-3rem)] md:h-auto overflow-y-auto bg-white rounded-lg border border-gray-200 p-2 md:p-4">
            <div className="mb-4">
              <div className="space-y-2">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                <ResultsCounter
                  filteredCount={products.length}
                  totalCount={products.length}
                  size="sm"
                  className="px-1"
                />
              </div>
            </div>

          <SearchFilters
            filters={filters}
            brands={brands}
            onChange={handleFilterChange}
          />
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div 
            className="fixed top-16 bottom-0 left-0 right-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <ActiveFilters
              filters={filters}
              searchQuery={searchQuery}
              brands={brands}
              onRemoveFilter={handleRemoveFilter}
              onClearFilters={handleClearFilters}
              onClearSearch={() => setSearchQuery('')}
              className="flex-1 min-w-0"
            />
            {/* View Toggle */}
            <div className="hidden md:flex rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={classNames(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:text-blue-600'
                )}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={classNames(
                  'p-2 transition-colors border-l border-gray-200',
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:text-blue-600'
                )}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          <ProductList
            products={products}
            loading={loading}
            error={error}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            gridCols={3}
            sortValue={filters.sort}
            onSortChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
            showViewToggle={false}
            emptyMessage="No products found. Try adjusting your filters."
          />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductListPage;
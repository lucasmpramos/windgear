import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Plus, ShoppingBag } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { getProducts } from '../lib/queries';
import { supabase } from '../lib/supabase';
import { Product, Brand } from '../types';
import ProductList from '../shared/components/ProductList';
import classNames from 'classnames';

const CATEGORIES = [
  'Kites',
  'Boards',
  'Harnesses',
  'Bars',
  'Accessories',
  'Wetsuits'
];

type ViewMode = 'grid' | 'list';

function Home() {
  const { t } = useTranslation();
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch brands
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('*')
          .order('name');
        
        if (brandsError) throw brandsError;
        setBrands(brandsData);

        // Fetch latest products
        const products = await getProducts();
        setLatestProducts(products.slice(0, 8)); // Show latest 8 products
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Unable to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-4 md:space-y-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621628669337-56bc3ed30d46?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="relative px-4 md:px-6 py-8 md:py-20 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">{t('home.hero.title')}</h1>
          <p className="text-sm md:text-lg text-white/90 mb-8">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-blue-600 px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm md:text-base font-medium"
            >
              <ShoppingBag className="h-5 w-5" />
              {t('home.hero.browseGear')}
            </Link>
            <Link
              to="/products/new"
              className="bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-2 text-sm md:text-base font-medium"
            >
              <Plus className="h-5 w-5" />
              {t('home.hero.listGear')}
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="hidden md:block text-3xl font-bold text-gray-900 mb-6">{t('home.browseByCategory')}</h2>
        
        {/* Mobile Dropdown */}
        <div className="md:hidden">
          <Menu as="div" className="relative">
            <Menu.Button className="w-full flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition">
              <span className="text-base font-medium text-gray-900">{t('common.category')}</span>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </Menu.Button>
            <Menu.Items className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg py-2">
                {CATEGORIES.map((category) => (
                  <Menu.Item key={category}>
                    {({ active }) => (
                      <Link
                        to={`/products?category=${category.toLowerCase()}`}
                        className={classNames( 
                          'block px-4 py-2 text-base',
                          active ? 'bg-gray-50 text-blue-600' : 'text-gray-900'
                        )}
                      >
                        {t(`products.categories.${category.toLowerCase()}`)}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
            </Menu.Items>
          </Menu>
        </div>
        
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/products?category=${category.toLowerCase()}`}
              className="group relative overflow-hidden"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-sm transition text-center relative z-10">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition duration-300">
                  {t(`products.categories.${category.toLowerCase()}`)}
                </h3>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Products */}
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-3 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">{t('products.latestListings')}</h2>
            <div className="flex items-center gap-4">              
              <Link 
                to="/products" 
                className="text-sm md:text-base text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                {t('common.viewAll')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-2 md:p-6">
          <ProductList
            products={latestProducts}
            loading={loading}
            error={error}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            gridCols={4}
            size="sm"
            emptyMessage={t('products.noListings')}
          />
        </div>
      </div>

      {/* Brands Section */}
      <div className="space-y-3 md:space-y-6">
        <h2 className="text-xl md:text-3xl font-bold text-gray-900">{t('home.popularBrands')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand=${brand.id}`}
              className="flex items-center justify-center p-3 md:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm hover:border-blue-200 transition-all duration-300 group relative overflow-hidden"
            >
              <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors duration-300 relative z-10">
                {brand.name}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from './AuthProvider';
import { MessageSquare, Settings, ShoppingBag, X, Plus, Package, UserCog, LogOut, Search, Shield, Home, User, Menu } from 'lucide-react';
import SearchResults from './SearchResults';
import { getProducts } from '../lib/queries';
import { Product, ProductCategory } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';
import debounce from '../utils/debounce';
import Avatar from './Avatar';
import LanguageSwitcher from '../shared/components/LanguageSwitcher';
import classNames from 'classnames';

const categories: ProductCategory[] = [
  'kites',
  'boards',
  'harnesses',
  'bars',
  'accessories',
  'wetsuits'
];

function Navbar() {
  const { t } = useTranslation();
  const { user } = useStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useClickOutside(searchRef, () => setShowResults(false));

  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getProducts({ search: query });
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
      setShowSearch(false);
    }
  };

  const handleCreateListing = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/products/new');
  };

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Navigation - Logo and Search */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="https://res.cloudinary.com/djz1gvdj5/image/upload/v1732582696/logo-full_heo35h.png" alt="Windgear" className="h-8" />
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-xl px-8" ref={searchRef}>
              <div className="relative">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder={t('common.searchPlaceholder')}
                    className="w-full px-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </form>
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setResults([]);
                    }}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {showResults && (searchQuery || results.length > 0) && (
                  <SearchResults
                    query={searchQuery}
                    products={results}
                    categories={filteredCategories}
                    loading={loading}
                    onClose={() => setShowResults(false)}
                  />
                )}
              </div>
            </div>

            {/* Mobile Search Button */}
            <div className="flex items-center gap-3 md:hidden">
              <LanguageSwitcher />
              <button
                onClick={() => setShowSearch(true)}
                className="text-gray-600"
              >
                <Search className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <LanguageSwitcher />
              <Link to="/products" className="text-gray-600 hover:text-blue-600">
                <ShoppingBag className="h-6 w-6" />
              </Link>

              <button
                onClick={handleCreateListing}
                className="text-gray-600 hover:text-blue-600"
                title="Create Listing"
              >
                <Plus className="h-6 w-6" />
              </button>

              {user ? (
                <>
                  <Link to="/messages" className="text-gray-600 hover:text-blue-600">
                    <MessageSquare className="h-6 w-6" title={t('navigation.messages')} />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      onBlur={() => setTimeout(() => setDropdownOpen(false), 100)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <Avatar
                        src={user.avatar_url}
                        alt={user.full_name || 'User'}
                        size="sm"
                      />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Package className="h-4 w-4" /> 
                          <span>{t('products.myListings')}</span>
                        </Link>
                        <Link
                          to="/products/new"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Plus className="h-4 w-4" />
                          <span>{t('products.newListing')}</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <UserCog className="h-4 w-4" />
                          <span>{t('navigation.settings')}</span>
                        </Link>
                        {user.is_admin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            <span>{t('navigation.admin')}</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            signOut();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{t('auth.signOut')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                >
                  {t('auth.signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              {user ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar_url}
                    alt={user.full_name || 'User'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.full_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="py-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    <Package className="h-5 w-5" />
                    <span>{t('products.myListings')}</span>
                  </Link>
                  <Link
                    to="/products/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="h-5 w-5" />
                    <span>{t('products.newListing')}</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    <UserCog className="h-5 w-5" />
                    <span>{t('navigation.settings')}</span>
                  </Link>
                  {user.is_admin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      <Shield className="h-5 w-5" />
                      <span>{t('navigation.admin')}</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{t('auth.signOut')}</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-5 w-5" />
                  <span>{t('auth.signIn')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 bg-white z-[60] md:hidden overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowSearch(false)}
                className="text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex-1 relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowResults(true);
                    }}
                    placeholder={t('common.searchPlaceholder')}
                    autoFocus
                    className="w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </form>
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setResults([]);
                    }}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            {(searchQuery || results.length > 0) && (
              <SearchResults
                query={searchQuery}
                products={results}
                categories={filteredCategories}
                loading={loading}
                showSearch={showSearch}
                onClose={() => {
                  setShowResults(false);
                  setShowSearch(false);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[51] md:hidden">
        <div className="flex justify-around items-center h-16">
          <Link to="/" className={classNames("p-3", isActive('/') ? 'text-blue-600' : 'text-gray-600')}>
            <Home className="h-6 w-6" />
          </Link>
          <Link to="/products" className={classNames("p-3", isActive('/products') ? 'text-blue-600' : 'text-gray-600')}>
            <ShoppingBag className="h-6 w-6" />
          </Link>
          <button onClick={handleCreateListing} className={classNames("p-3", isActive('/products/new') ? 'text-blue-600' : 'text-gray-600')}>
            <Plus className="h-6 w-6" />
          </button>
          <Link to="/messages" className={classNames("p-3", isActive('/messages') ? 'text-blue-600' : 'text-gray-600')}>
            <MessageSquare className="h-6 w-6" />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className={classNames("p-3", mobileMenuOpen ? 'text-blue-600' : 'text-gray-600')}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
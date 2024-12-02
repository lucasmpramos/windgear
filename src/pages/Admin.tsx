import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getProducts } from '../lib/queries';
import { supabase } from '../lib/supabase';
import { Product, User } from '../types';
import { Package, Users, AlertCircle, TrendingUp, Grid } from 'lucide-react';
import toast from 'react-hot-toast';
import classNames from 'classnames';
import ListingsTab from '../components/admin/ListingsTab';
import UsersTab from '../components/admin/UsersTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import CatalogTab from '../components/admin/CatalogTab';
import AdminSearchBar from '../components/admin/AdminSearchBar';

type Tab = 'listings' | 'users' | 'analytics' | 'catalog';

function Admin() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!user?.is_admin) return;

      try {
        setError(null);
        
        // Fetch data with adminSearch flag
        if (activeTab === 'listings') {
          const allProducts = await getProducts({ adminSearch: true });
          if (mounted) {
            setProducts(allProducts);
          }
        } else if (activeTab === 'users') {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (userError) throw userError;
          if (mounted) {
            setUsers(userData);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (mounted) {
          setError('Failed to load data');
          toast.error('Failed to load data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchData();

    return () => {
      mounted = false;
    };
  }, [user?.is_admin, activeTab]);

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <AdminSearchBar className="w-full sm:w-96" />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('listings')}
              className={classNames(
                'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'listings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Package className="h-5 w-5" />
              All Listings
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={classNames(
                'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Users className="h-5 w-5" />
              All Users
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={classNames(
                'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <TrendingUp className="h-5 w-5" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={classNames(
                'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'catalog'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Grid className="h-5 w-5" />
              Catalog
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              {activeTab === 'listings' 
                ? 'All Listings' 
                : activeTab === 'users'
                ? 'All Users'
                : activeTab === 'analytics'
                ? 'Analytics'
                : 'Catalog Management'}
            </h2>
          </div>

          {error ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800"
              >
                Try Again
              </button>
            </div>
          ) : activeTab === 'listings' ? (
            <ListingsTab
              products={products}
              setProducts={setProducts}
              loading={loading}
            />
          ) : activeTab === 'users' ? (
            <UsersTab
              users={users}
              setUsers={setUsers}
              loading={loading}
              currentUserId={user.id}
            />
          ) : activeTab === 'analytics' ? (
            <AnalyticsTab />
          ) : (
            <CatalogTab />
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
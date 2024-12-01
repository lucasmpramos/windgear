import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Users, Grid3X3, TrendingUp, Eye } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface Stats {
  totalProducts: number;
  totalUsers: number;
  totalViews: number;
  totalValue: number;
  totalBrands: number;
  totalCategories: number;
  monthlyStats: any[];
  categoryStats: any[];
  brandStats: any[];
  recentActivity: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalUsers: 0,
    totalViews: 0,
    totalValue: 0,
    totalBrands: 0,
    totalCategories: 0,
    monthlyStats: [],
    categoryStats: [],
    brandStats: [],
    recentActivity: []
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*');

        if (productsError) throw productsError;

        // Get total users
        const { count: userCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total brands
        const { count: brandCount, error: brandsError } = await supabase
          .from('brands')
          .select('*', { count: 'exact', head: true });

        // Get total categories
        const { count: categoryCount, error: categoriesError } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        if (brandsError) throw brandsError;
        if (categoriesError) throw categoriesError;

        // Calculate monthly stats for the last 6 months
        const monthlyStats = [];
        for (let i = 0; i < 6; i++) {
          const startDate = startOfMonth(subMonths(new Date(), i));
          const endDate = endOfMonth(startDate);
          const monthProducts = products.filter(p => {
            const productDate = new Date(p.created_at);
            return productDate >= startDate && productDate <= endDate;
          }); 

          monthlyStats.unshift({
            name: format(startDate, 'MMM'),
            count: monthProducts.length,
            value: monthProducts.reduce((sum, p) => sum + (p.price || 0), 0)
        });
        }

        // Calculate category stats
        const { data: categories } = await supabase
          .from('categories')
          .select('*, products(*)');

        const categoryStats = categories?.map(category => ({
          name: category.name,
          count: category.products?.length || 0,
          value: category.products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0
        })).sort((a, b) => b.count - a.count) || [];

        // Calculate brand stats
        const { data: brands } = await supabase
          .from('brands')
          .select('*, products(*)');

        const brandStats = brands?.map(brand => ({
          name: brand.name,
          count: brand.products?.length || 0,
          value: brand.products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0
        })).sort((a, b) => b.count - a.count) || [];

        // Calculate totals
        const totalProducts = products.length;
        const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);

        setStats({
          totalProducts,
          totalUsers: userCount || 0,
          totalViews,
          totalValue,
          totalBrands: brandCount || 0,
          totalCategories: categoryCount || 0,
          monthlyStats,
          categoryStats,
          brandStats,
          recentActivity: []
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }


    fetchStats();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Products Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Total Value Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        {/* Brands Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Brands</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBrands}</p>
            </div>
            <Grid3X3 className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        {/* Views Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>
            <Eye className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Brand Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Brand Distribution</h3>
        <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.brandStats}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" name="Total Value ($)" />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Category Distribution</h3>
        <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.categoryStats}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" name="Total Value ($)" />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Monthly Trends</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.monthlyStats}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorCount)"
                name="Number of Products"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorValue)"
                name="Total Value ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
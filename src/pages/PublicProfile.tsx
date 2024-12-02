import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getProducts } from '../lib/queries';
import { User, Product } from '../types';
import { MapPin, Calendar, MessageSquare, Loader, AlertCircle, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../shared/components/Avatar';
import ProductList from '../shared/components/ProductList';
import MetaTags from '../components/MetaTags';

function PublicProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;

        setUser(profile);

        // Fetch user's products
        const products = await getProducts({ sellerId: id });
        setProducts(products);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">The profile you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTags 
        title={user.full_name || 'Seller Profile'}
        description={`View ${user.full_name || 'seller'}'s kitesurfing gear listings`}
        image={user.avatar_url}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <Avatar
                src={user.avatar_url}
                alt={user.full_name || 'User'}
                size="lg"
                className="mx-auto md:mx-0"
              />

              {/* User Info */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.full_name || 'Anonymous User'}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{products.length} listings</span>
                  </div>
                </div>

                {user.bio && (
                  <p className="mt-4 text-gray-600 max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Contact Button */}
              {user.whatsapp && (
                <button
                  onClick={() => {
                    const message = encodeURIComponent(
                      `Hi ${user.full_name}, I'm interested in your listings on Windgear.`
                    );
                    window.open(
                      `https://wa.me/${user.whatsapp.replace(/\D/g, '')}?text=${message}`,
                      '_blank'
                    );
                  }}
                  className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Contact on WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {user.full_name}'s Listings
          </h2>

          <ProductList
            products={products}
            viewMode="grid"
            gridCols={4}
            showViewToggle={false}
            emptyMessage="No listings yet"
          />
        </div>
      </div>
    </>
  );
}

export default PublicProfile;
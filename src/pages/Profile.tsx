import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { Package, Plus, Pencil, Trash2, Loader, UserCog, Eye, Shield, Bookmark, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts, getSavedItems, deleteProduct } from '../lib/queries';
import classNames from 'classnames';
import Avatar from '../shared/components/Avatar';
import ImageComponent from '../shared/components/ImageComponent';
import ConditionBadge from '../shared/components/ConditionBadge';
import StatusBadge from '../shared/components/StatusBadge';
import SaveButton from '../shared/components/SaveButton';
import { Product } from '../types';
type Tab = 'listings' | 'saved' | 'drafts';

function Profile() {
  const { t } = useTranslation();
  const { user } = useStore();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [draftProducts, setDraftProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewProductId, setPreviewProductId] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const [products, drafts, saved] = await Promise.all([
        getProducts({ sellerId: user.id, status: 'active' }),
        getProducts({ sellerId: user.id, status: 'draft' }),
        getSavedItems(user.id)
      ]);
      setUserProducts(products);
      setDraftProducts(drafts);
      setSavedItems(saved);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleDelete = async (productId: string) => {
    if (!user || deleting) return;

    const confirmed = window.confirm('Are you sure you want to delete this listing? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(productId);
      await deleteProduct(productId, user.id);
      
      // Update local state
      setUserProducts(prev => prev.filter(p => p.id !== productId));
      setSavedItems(prev => prev.filter(p => p.id !== productId));
      
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaveChange = (productId: string, isSaved: boolean) => {
    setSavedItems(prev => 
      isSaved 
        ? prev 
        : prev.filter(item => item.id !== productId)
    );
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Please sign in to view your profile</h2>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-white shadow-sm mb-4 md:mb-6 rounded-xl">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 flex items-center gap-6">
          <div className="flex-shrink-0 hidden md:block">
            <Avatar
              src={user.avatar_url}
              alt={user.full_name || 'User'}
              size="lg"
            />
          </div>
          <div className="flex-shrink-0 md:hidden">
            <Avatar
              src={user.avatar_url}
              alt={user.full_name || 'User'}
              size="md"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {user.full_name || 'Anonymous User'}
              </h1>
              {user.is_admin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
            {user.whatsapp && (
              <p className="text-sm text-gray-600 truncate">{user.whatsapp}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              to="/settings"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <UserCog className="h-4 w-4" />
              <span className="hidden md:inline">{t('navigation.settings')}</span>
            </Link>
            <Link
              to="/products/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">{t('products.newListing')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white md:rounded-xl shadow-sm">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('listings')}
            className={classNames(
              'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
              activeTab === 'listings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Package className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base font-medium">{t('products.myListings')}</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={classNames(
              'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Bookmark className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base font-medium">{t('products.savedItems')}</span>
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={classNames(
              'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
              activeTab === 'drafts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <FileText className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base font-medium">{t('products.status.draft')}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : activeTab === 'listings' && userProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t('products.noListings')}</p>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>{t('products.createFirst')}</span>
            </Link>
          </div>
        ) : activeTab === 'saved' && savedItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('products.noSavedItems')}</p>
          </div>
        ) : activeTab === 'drafts' && draftProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t('products.noDrafts')}</p>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>{t('products.createFirst')}</span>
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {(activeTab === 'listings' ? userProducts : 
               activeTab === 'saved' ? savedItems : 
               draftProducts).map((product) => (
              <div key={product.id} className="flex gap-2 md:gap-4 p-2 md:p-4 border rounded-lg hover:bg-gray-50">
                <Link 
                  to={`/products/${product.id}`}
                  className="flex gap-4 flex-1 min-w-0"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <ImageComponent
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
                      <span className="text-[11px] md:text-sm font-medium text-blue-600">
                        {product.brand?.name}
                      </span>
                      {product.model && (
                        <>
                          <span className="text-gray-400 text-[12px] md:text-sm">·</span>
                          <span className="text-[13px] md:text-sm text-gray-600">{product.model}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm md:text-lg font-medium text-gray-900 truncate mb-0.5 md:mb-2">{product.title}</h3>
                    <div className="flex items-center gap-1 md:gap-3">
                      <span className="text-[13px] md:text-lg text-gray-900">
                        ${product.price.toLocaleString()}
                      </span>
                      <ConditionBadge condition={product.condition} className="hidden md:inline-flex" />
                      <StatusBadge status={product.status} className="hidden md:inline-flex" />
                    </div>
                  </div>
                </Link>
                {activeTab === 'listings' ? (
                  <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewProductId(product.id)}
                      className="p-1.5 md:p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                      title="Preview as buyer"
                    >
                      <Eye className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="p-1.5 md:p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4 md:h-5 md:w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="p-1.5 md:p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      {deleting === product.id ? (
                        <Loader className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-gray-400 text-[10px] md:text-sm">
                    <Eye className="h-3 w-3 md:h-4 md:w-4" />
                    <span>{product.views || 0}</span>
                  </div>
                </div>
                ) : (
                <div className="flex flex-col items-end gap-2">
                  <SaveButton
                    productId={product.id}
                    initialSaved={true}
                    onSaveChange={(saved) => handleSaveChange(product.id, saved)}
                    size={window.innerWidth < 768 ? 'sm' : 'md'}
                  />
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <Eye className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-[12px] md:text-sm">{product.views || 0}</span>
                  </div>
                </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewProductId && (
        <PreviewModal
          isOpen={!!previewProductId}
          onClose={() => setPreviewProductId(null)}
          productId={previewProductId}
        />
      )}
    </div>
  );
}

export default Profile;
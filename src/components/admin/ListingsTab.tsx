import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types';
import { Pencil, Trash2, Loader, FileText, Check, ChevronDown } from 'lucide-react';
import ImageComponent from '../ImageComponent';
import ConditionBadge from '../ConditionBadge';
import StatusBadge from '../StatusBadge';
import { deleteProduct } from '../../lib/queries';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import UserSelect from '../../shared/components/UserSelect';
import { supabase } from '../../lib/supabase';
import { Menu } from '@headlessui/react';
import classNames from 'classnames';

interface ListingsTabProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  loading: boolean;
}

function ListingsTab({ products, setProducts, loading }: ListingsTabProps) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showUserSelect, setShowUserSelect] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length || bulkActionLoading) return;

    const confirmed = window.confirm(`Are you sure you want to delete ${selectedIds.length} listings? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setBulkActionLoading(true);
      await Promise.all(selectedIds.map(id => deleteProduct(id, 'admin')));
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      toast.success(`Successfully deleted ${selectedIds.length} listings`);
    } catch (error) {
      console.error('Error deleting products:', error);
      toast.error('Failed to delete some listings');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStatusChange = async (status: 'available' | 'sold' | 'reserved' | 'draft') => {
    if (!selectedIds.length || bulkActionLoading) return;

    try {
      setBulkActionLoading(true);
      const { error } = await supabase
        .from('products')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedIds);

      if (error) throw error;

      setProducts(prev => prev.map(p => 
        selectedIds.includes(p.id) ? { ...p, status } : p
      ));
      setSelectedIds([]);
      toast.success(`Successfully updated ${selectedIds.length} listings`);
    } catch (error) {
      console.error('Error updating products:', error);
      toast.error('Failed to update some listings');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkAssignUser = async (user: User | null) => {
    if (!selectedIds.length || bulkActionLoading || !user) return;

    try {
      setBulkActionLoading(true);
      const { error } = await supabase
        .from('products')
        .update({ 
          seller_id: user.id,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedIds);

      if (error) throw error;

      setProducts(prev => prev.map(p => 
        selectedIds.includes(p.id) ? { ...p, seller: user, seller_id: user.id } : p
      ));
      setSelectedIds([]);
      setShowUserSelect(false);
      toast.success(`Successfully assigned ${selectedIds.length} listings to ${user.full_name}`);
    } catch (error) {
      console.error('Error assigning user:', error);
      toast.error('Failed to assign user to some listings');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (deleting) return;

    const confirmed = window.confirm('Are you sure you want to delete this listing? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(productId);
      await deleteProduct(productId, 'admin');
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 p-4 mb-4 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedIds.length} {selectedIds.length === 1 ? 'listing' : 'listings'} selected
            </span>
            <div className="flex items-center gap-2">
              {showUserSelect ? (
                <div className="w-64">
                  <UserSelect
                    selectedUser={null}
                    onUserSelect={handleBulkAssignUser}
                    onCancel={() => setShowUserSelect(false)}
                  />
                </div>
              ) : (
                <>
                  <Menu as="div" className="relative">
                    <Menu.Button 
                      disabled={bulkActionLoading}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Change Status
                      <ChevronDown className="h-4 w-4" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      {['available', 'reserved', 'sold', 'draft'].map((status) => (
                        <Menu.Item key={status}>
                          {({ active }) => (
                            <button
                              onClick={() => handleBulkStatusChange(status as any)}
                              className={classNames(
                                'w-full text-left px-4 py-2 text-sm',
                                active ? 'bg-gray-50 text-blue-600' : 'text-gray-700'
                              )}
                            >
                              {t(`products.status.${status}`)}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Menu>
                  <button
                    onClick={() => setShowUserSelect(true)}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Assign User
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {bulkActionLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      'Delete Selected'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === products.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => handleSelectOne(product.id)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <ImageComponent
                        src={product.images[0]}
                        alt={product.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        {product.title}
                        {product.status === 'draft' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            <FileText className="h-3 w-3" />
                            {t('products.status.draft')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.brand?.name} {product.model}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.seller ? (
                    <>
                      <div className="text-sm text-gray-900">{product.seller.full_name}</div>
                      <div className="text-sm text-gray-500">{product.seller.email}</div>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No seller assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${product.price.toLocaleString()}
                  </div>
                  <ConditionBadge condition={product.condition} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={product.status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deleting === product.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleting === product.id ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ListingsTab;
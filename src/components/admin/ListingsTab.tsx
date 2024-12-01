import React, { useState } from 'react';
import { Product } from '../../types';
import { Pencil, Trash2, Loader } from 'lucide-react';
import ImageComponent from '../ImageComponent';
import ConditionBadge from '../ConditionBadge';
import StatusBadge from '../StatusBadge';
import { deleteProduct } from '../../lib/queries';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ListingsTabProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  loading: boolean;
}

function ListingsTab({ products, setProducts, loading }: ListingsTabProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                      <div className="text-sm font-medium text-gray-900">
                        {product.title}
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
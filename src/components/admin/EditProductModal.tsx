import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Product, Brand, User } from '../../types';
import { X, Loader, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import DragDropImageUploader from '../DragDropImageUploader';
import { updateProductImages } from '../../lib/storage';
import Avatar from '../Avatar';
import debounce from '../../utils/debounce';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onProductUpdate: (product: Product) => void;
}

function EditProductModal({ isOpen, onClose, product, onProductUpdate }: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>(product.images);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<User | null>(product.seller || null);
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    price: product.price.toString(),
    condition: product.condition,
    category: product.category,
    location: product.location,
    brand_id: product.brand_id || '',
    model: product.model || '',
    year: product.year?.toString() || '',
    status: product.status,
    seller_id: product.seller_id || null
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
        toast.error('Failed to load brands');
      }
    }
    fetchBrands();
  }, []);

  // Search users
  const searchUsers = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  }, 300);

  useEffect(() => {
    searchUsers(userSearch);
  }, [userSearch]);

  const handleImagesChange = (images: (File | string)[]) => {
    const newCurrentImages = images.filter((img): img is string => typeof img === 'string');
    const newFilesList = images.filter((img): img is File => img instanceof File);
    
    const removedOnes = currentImages.filter(img => !newCurrentImages.includes(img));
    setRemovedImages(prev => [...prev, ...removedOnes]);
    
    setCurrentImages(newCurrentImages);
    setNewFiles(newFilesList);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectSeller = async (user: User) => {
    setSelectedSeller(user);
    setFormData(prev => ({ ...prev, seller_id: user.id }));
    setUserSearch('');
    setSearchResults([]);
  };

  const handleRemoveSeller = () => {
    setSelectedSeller(null);
    setFormData(prev => ({ ...prev, seller_id: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalImages = currentImages.length + newFiles.length;
    if (totalImages === 0) {
      toast.error('Please add at least one image');
      return;
    }

    try {
      setLoading(true);

      // Update images first
      const updatedImageUrls = await updateProductImages(
        formData.seller_id || 'admin',
        currentImages,
        newFiles,
        removedImages
      );

      // Update product data
      const { data, error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          condition: formData.condition as 'new' | 'used',
          category: formData.category,
          location: formData.location,
          brand_id: formData.brand_id || null,
          model: formData.model || null,
          year: formData.year ? parseInt(formData.year) : null,
          images: updatedImageUrls,
          status: formData.status,
          seller_id: formData.seller_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)
        .select(`
          *,
          seller:profiles(*)
        `)
        .single();

      if (error) throw error;

      onProductUpdate(data);
      toast.success('Product updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Edit Product
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Seller Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seller
                    </label>
                    {selectedSeller ? (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={selectedSeller.avatar_url}
                            alt={selectedSeller.full_name || 'Seller'}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedSeller.full_name || 'Anonymous'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedSeller.email}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveSeller}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search users by name or email..."
                          className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        {searching && (
                          <Loader className="absolute right-3 top-2.5 h-5 w-5 text-blue-500 animate-spin" />
                        )}
                        {searchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                            {searchResults.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => handleSelectSeller(user)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                              >
                                <Avatar
                                  src={user.avatar_url}
                                  alt={user.full_name || 'User'}
                                  size="sm"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.full_name || 'Anonymous'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {user.email}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images
                    </label>
                    <DragDropImageUploader
                      images={[...currentImages, ...newFiles]}
                      onImagesChange={handleImagesChange}
                      maxImages={5}
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Brand, Model & Year */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700">
                        Brand
                      </label>
                      <select
                        id="brand_id"
                        name="brand_id"
                        value={formData.brand_id}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                        Model
                      </label>
                      <input
                        type="text"
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        Year
                      </label>
                      <input
                        type="number"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category & Condition */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select category</option>
                        {['kites', 'boards', 'harnesses', 'bars', 'accessories', 'wetsuits'].map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                        Condition
                      </label>
                      <select
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader className="h-5 w-5 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditProductModal;
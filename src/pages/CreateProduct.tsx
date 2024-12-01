import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { getCategories } from '../lib/queries';
import { Loader } from 'lucide-react';
import { uploadProductImages } from '../lib/storage';
import toast from 'react-hot-toast';
import DragDropImageUploader from '../components/DragDropImageUploader';
import BackButton from '../components/BackButton';
import MetaTags from '../components/MetaTags';
import StatusBadge from '../shared/components/StatusBadge';
import AdminBanner from '../shared/components/AdminBanner';
import UserSelect from '../shared/components/UserSelect';
import Combobox from '../shared/components/Combobox';
import Select from '../shared/components/Select';

function CreateProduct() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<User | null>(user);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'available' as 'available' | 'sold' | 'reserved',
    price: '',
    condition: '',
    category: '',
    location: '',
    brand_id: '',
    model: '',
    year: ''
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    const data = await getCategories();
    setCategories(data);
  }, []);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedFiles.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    try {
      setLoading(true);

      // Upload images first
      const imageUrls = await uploadProductImages(user.id, selectedFiles);

      // Create product
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          condition: formData.condition as 'new' | 'used',
          category: formData.category,
          location: formData.location,
          brand_id: formData.brand_id || null,
          model: formData.model || null,
          year: formData.year ? parseInt(formData.year) : null,
          images: imageUrls,
          seller_id: user?.is_admin ? selectedSeller?.id || user.id : user?.id,
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Product listed successfully');
      navigate(`/products/${product.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <MetaTags 
        title={t('products.newListing')}
        description="Create a new listing to sell your kitesurfing gear"
      />

      <div className="max-w-2xl mx-auto py-4 md:py-8 px-4">
        <div className="mb-4">
          <BackButton label={t('products.backToProducts')} />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{t('products.newListing')}</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Admin Banner */}
            <AdminBanner />
            
            {/* Seller Selection */}
            <UserSelect
              selectedUser={selectedSeller}
              onUserSelect={setSelectedSeller}
              className="p-4 md:p-6"
            />
            
            {/* Status Section */}
            <div className="p-4 md:p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('common.status')}</h2>
              <div className="flex items-center gap-4">
                <StatusBadge status={formData.status} />
                <Select
                  options={[
                    { id: 'available', name: t('products.status.available') },
                    { id: 'reserved', name: t('products.status.reserved') },
                    { id: 'sold', name: t('products.status.sold') }
                  ]}
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'available' | 'sold' | 'reserved' }))}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="p-4 md:p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('common.productImages')}</h2>
              <DragDropImageUploader
                images={selectedFiles}
                onImagesChange={setSelectedFiles}
                maxImages={5}
              />
            </div>

            {/* Basic Info Section */}
            <div className="p-4 md:p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('common.basicInfo')}</h2>
              
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  {t('common.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder={t('common.placeholders.title')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Brand, Model & Year */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700">
                    {t('common.brands')}
                  </label>
                  <Combobox
                    options={brands}
                    selectedIds={formData.brand_id ? [formData.brand_id] : []}
                    onChange={(ids) => setFormData(prev => ({ ...prev, brand_id: ids[0] || '' }))}
                    placeholder={t('common.selectBrand')}
                    className="mt-1"
                    multiple={false}
                  />
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                    {t('common.model')}
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder={t('common.placeholders.model')}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    {t('common.year')}
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    placeholder={t('common.placeholders.year')}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  {t('common.description')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder={t('common.placeholders.description')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="p-4 md:p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('common.details')}</h2>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  {t('common.price')}
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
                    placeholder={t('common.placeholders.price')}
                    className="block w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    {t('common.category')}
                  </label>
                  <Combobox
                    options={categories}
                    selectedIds={formData.category ? [formData.category] : []}
                    onChange={(ids) => setFormData(prev => ({ ...prev, category: ids[0] || '' }))}
                    placeholder={t('common.selectCategory')}
                    className="mt-1"
                    multiple={false}
                  />
                </div>
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                    {t('common.condition')}
                  </label>
                  <Select
                    options={[
                      { id: 'new', name: t('products.conditions.new') },
                      { id: 'used', name: t('products.conditions.used') }
                    ]}
                    value={formData.condition}
                    onChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                    placeholder={t('common.selectCondition')}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  {t('common.location')}
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder={t('common.placeholders.location')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Section */}
            <div className="p-4 md:p-6 bg-gray-50">
              <div className="flex flex-col-reverse md:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="flex-1 bg-white text-gray-700 py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm md:text-base font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm md:text-base font-medium"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>{t('common.creating')}</span>
                    </span>
                  ) : (
                    t('products.newListing')
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </>
  );
}

export default CreateProduct;
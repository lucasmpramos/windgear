import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getCategories, getBrandModels } from '../lib/queries';
import { Loader } from 'lucide-react';
import { updateProductImages } from '../lib/storage';
import toast from 'react-hot-toast';
import DragDropImageUploader from '../components/DragDropImageUploader';
import BackButton from '../components/BackButton';
import MetaTags from '../components/MetaTags';
import Combobox from '../shared/components/Combobox';
import AdminBanner from '../shared/components/AdminBanner';
import UserSelect from '../shared/components/UserSelect';
import Select from '../shared/components/Select';
import classNames from 'classnames';
import { supabase } from '../lib/supabase';
import StatusBadge from '../components/StatusBadge';
import { useStore } from '../store/useStore';

function EditProduct() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<User | null>(user);
  const [initialLoad, setInitialLoad] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: '',
    category: '',
    location: '',
    brand_id: '',
    model: '',
    year: '',
    status: 'available' as 'available' | 'sold' | 'reserved'
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

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      if (!id || !initialLoad) return;
      
      try {
        setLoading(true);
        const data = await getProduct(id);
        
        // Check if the user is the owner or admin
        if (!user || (!user.is_admin && data.seller_id !== user.id)) {
          toast.error("You don't have permission to edit this listing");
          navigate('/profile');
          return;
        }

        setCurrentImages(data.images);
        setSelectedSeller(data.seller);
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          condition: data.condition,
          category: data.category,
          location: data.location,
          brand_id: data.brand_id || '',
          model: data.model || '',
          year: data.year?.toString() || '',
          status: data.status
        });
        setInitialLoad(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        toast.error('Failed to load product details');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
    fetchBrands();
    fetchCategories();
  }, [id, user, navigate, fetchBrands, fetchCategories, initialLoad]);

  // Fetch models when brand changes
  useEffect(() => {
    async function fetchModels() {
      if (!formData.brand_id || !user) {
        setModels([]);
        return;
        if (!formData.brand_id || !user || !initialLoad) return;
      }

      try {
        const data = await getBrandModels(formData.brand_id);
        
        // If we have a current model name, find and select its ID
        if (formData.model) {
          const existingModel = data.find(m => m.name === formData.model);
          if (existingModel) {
            setFormData(prev => ({
              ...prev,
              model: existingModel.name
            }));
          }
        }
        
        setModels(data);
      } catch (err) {
        console.error('Error fetching models:', err);
        toast.error('Failed to load models');
      }
    }

    fetchModels();
  }, [formData.brand_id, user?.id, initialLoad]);

  const handleImagesChange = (images: (File | string)[]) => {
    const newCurrentImages = images.filter((img): img is string => typeof img === 'string');
    const newFilesList = images.filter((img): img is File => img instanceof File);
    
    // Update removed images
    const removedOnes = currentImages.filter(img => !newCurrentImages.includes(img));
    setRemovedImages(prev => [...prev, ...removedOnes]);
    
    setCurrentImages(newCurrentImages);
    setNewFiles(newFilesList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    const totalImages = currentImages.length + newFiles.length;
    if (totalImages === 0) {
      toast.error(t('common.addImageRequired'));
      return;
    }

    try {
      setSaving(true);

      // Update images first
      const updatedImageUrls = await updateProductImages(
        selectedSeller?.id || user.id,
        currentImages,
        newFiles,
        removedImages
      );

      // Set status to draft if no seller is selected in admin mode
      const status = user?.is_admin && !selectedSeller ? 'draft' : formData.status;

      // Update product data
      const updateQuery = supabase
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
          seller_id: user?.is_admin ? selectedSeller?.id || null : user.id,
          images: updatedImageUrls,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      // Only add seller_id check if not admin
      if (!user.is_admin) {
        updateQuery.eq('seller_id', user.id);
      }

      const { error } = await updateQuery;

      if (error) throw error;

      toast.success(t('products.updateSuccess'));
      navigate(`/products/${id}`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(t('products.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <MetaTags 
        title={t('products.editListing')}
        description={formData.title}
      />

      <div className="max-w-2xl mx-auto py-4 md:py-8 px-4">
        <div className="mb-4">
          <BackButton label={t('products.backToListing')} />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{t('products.editListing')}</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Admin Banner */}
            <AdminBanner />
            
            {/* Current Status */}
            <div className="p-4 md:p-6 space-y-4">
              {/* Seller Selection */}
              <UserSelect
                selectedUser={selectedSeller}
                onUserSelect={setSelectedSeller}
                optional={user?.is_admin}
                className="mb-6"
              />

              <h2 className="text-lg font-medium text-gray-900">{t('common.status')}</h2>
              <div className="flex items-center gap-4">
                <StatusBadge status={formData.status} />
                <Select
                  options={[
                    { id: 'available', name: t('products.status.available') },
                    { id: 'reserved', name: t('products.status.reserved') },
                    { id: 'sold', name: t('products.status.sold') },
                    { id: 'draft', name: t('products.status.draft') }
                  ]}
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'available' | 'sold' | 'reserved' | 'draft' }))}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="p-4 md:p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('common.productImages')}</h2>
              <DragDropImageUploader
                images={[...currentImages, ...newFiles]}
                onImagesChange={handleImagesChange}
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
                    displayValue={(selectedOptions) => selectedOptions[0]?.name || ''}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                    {t('common.model')}
                  </label>
                  <Combobox
                    options={models}
                    selectedIds={models.find(m => m.name === formData.model)?.id ? [models.find(m => m.name === formData.model)!.id] : []}
                    onChange={(ids) => {
                      const selectedModel = models.find(m => m.id === ids[0]);
                      if (selectedModel) {
                        setFormData(prev => ({
                          ...prev,
                          model: selectedModel.name
                        }));
                      }
                    }}
                    placeholder={t('common.selectModel')}
                    className="mt-1"
                    multiple={false}
                    disabled={!formData.brand_id}
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
                  onClick={() => navigate(`/products/${id}`)}
                  className="flex-1 bg-white text-gray-700 py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm md:text-base font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm md:text-base font-medium"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>{t('common.saving')}</span>
                    </span>
                  ) : (
                    t('products.editListing')
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

export default EditProduct;
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Brand } from '../../types';
import { Plus, Pencil, Trash2, Loader, AlertCircle, Link as LinkIcon } from 'lucide-react';
import Select from '../../shared/components/Select';
import toast from 'react-hot-toast';
import classNames from 'classnames';

type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type Model = {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
  brand?: Brand;
  created_at: string;
};

type TabType = 'categories' | 'brands' | 'models';

function CatalogTab() {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [brandOptions, setBrandOptions] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [allModels, setAllModels] = useState<Model[]>([]);

  useEffect(() => {
    fetchData();
    if (activeTab === 'models') {
      fetchBrands();
    }
  }, [activeTab]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBrandOptions(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      toast.error('Failed to load brands');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'categories') {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setCategories(data);
      } else {
        if (activeTab === 'brands') {
          const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('name');
          
          if (error) throw error;
          setBrands(data);
        } else {
          const { data, error } = await supabase
            .from('models')
            .select(`
              *,
              brand:brands(*)
            `)
            .order('name');
          
          if (error) throw error;
          setAllModels(data);
          // Filter models if a brand is selected
          if (selectedBrandId) {
            setModels(data.filter(model => model.brand_id === selectedBrandId));
          } else {
            setModels(data);
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
      setError(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  // Update models when brand selection changes
  useEffect(() => {
    if (selectedBrandId) {
      setModels(allModels.filter(model => model.brand_id === selectedBrandId));
    } else {
      setModels(allModels);
    }
  }, [selectedBrandId, allModels]);

  // Handle adding new items
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || saving || (activeTab === 'models' && !selectedBrandId)) return;
    const slug = newItemName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      setSaving(true);
      
      if (activeTab === 'categories') {
        const { error } = await supabase
          .from('categories')
          .insert({ name: newItemName, slug });
        
        if (error) throw error;
      } else {
        if (activeTab === 'brands') {
          const { error } = await supabase
            .from('brands')
            .insert({ name: newItemName });
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('models')
            .insert({
              name: newItemName,
              slug,
              brand_id: selectedBrandId
            });
          if (error) throw error;
        }
      }

      setNewItemName('');
      fetchData();
      toast.success(`${activeTab === 'categories' ? 'Category' : 'Brand'} added successfully`);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(`Failed to add ${activeTab === 'categories' ? 'category' : 'brand'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || saving) return;
    const slug = editingItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      setSaving(true);
      
      if (activeTab === 'categories') {
        const { error } = await supabase
          .from('categories')
          .update({ name: editingItem.name, slug })
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        if (activeTab === 'brands') {
          const { error } = await supabase
            .from('brands')
            .update({ name: editingItem.name })
            .eq('id', editingItem.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('models')
            .update({
              name: editingItem.name,
              slug,
              brand_id: selectedBrandId
            })
            .eq('id', editingItem.id);
          
          if (error) throw error;
        }
      }

      setEditingItem(null);
      fetchData();
      toast.success(`${activeTab === 'categories' ? 'Category' : 'Brand'} updated successfully`);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(`Failed to update ${activeTab === 'categories' ? 'category' : 'brand'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleting) return;

    const confirmed = window.confirm(`Are you sure you want to delete this ${activeTab === 'categories' ? 'category' : 'brand'}?`);
    if (!confirmed) return;

    try {
      setDeleting(id);
      
      const { error } = await supabase
        .from(activeTab)
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchData();
      toast.success(`${activeTab === 'categories' ? 'Category' : 'Brand'} deleted successfully`);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(`Failed to delete ${activeTab === 'categories' ? 'category' : 'brand'}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={classNames(
              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={classNames(
              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'brands'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Brands
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={classNames(
              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'models'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Models
          </button>
        </nav>
      </div>

      {/* Add New Form */}
      <form onSubmit={handleAdd} className="flex gap-4">
        {activeTab === 'models' && (
          <Select
            options={brandOptions}
            value={selectedBrandId}
            onChange={setSelectedBrandId}
            placeholder="Select Brand"
            className="w-64"
          />
        )}
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder={`Add new ${activeTab === 'categories' ? 'category' : activeTab === 'brands' ? 'brand' : 'model'}...`}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button
          type="submit"
          disabled={saving || !newItemName.trim() || (activeTab === 'models' && !selectedBrandId)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          <span>Add</span>
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 text-red-600 py-8">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      ) : (activeTab === 'categories' ? categories : activeTab === 'brands' ? brands : models).length === 0 ? (
        <p className="text-center text-gray-500 py-8">No {activeTab} found</p>
      ) : (
        <div className="space-y-2">
          {(activeTab === 'categories' ? categories : activeTab === 'brands' ? brands : models).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
            >
              {editingItem?.id === item.id ? (
                <form onSubmit={handleUpdate} className="flex-1 flex gap-4 items-center">
                  {activeTab === 'models' && (
                    <Select
                      options={brandOptions}
                      value={selectedBrandId}
                      onChange={setSelectedBrandId}
                      placeholder="Select Brand"
                      className="w-64"
                    />
                  )}
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving || !editingItem.name.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  {activeTab === 'models' && item.brand && (
                    <>
                      <span className="text-blue-600 font-medium">{item.brand.name}</span>
                      <span className="text-gray-400">·</span>
                    </>
                  )}
                  <span className="text-gray-900">{item.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingItem({ id: item.id, name: item.name })}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  {deleting === item.id ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CatalogTab;
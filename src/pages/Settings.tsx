import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Camera, Loader, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import BackButton from '../components/BackButton';

function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    whatsapp: user?.whatsapp || ''
  });

  // Fetch current profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setFormData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          location: data.location || '',
          whatsapp: data.whatsapp || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfile();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      let avatarUrl = user.avatar_url;

      // Upload new avatar if changed
      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatar, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          avatar_url: avatarUrl,
          bio: formData.bio,
          location: formData.location,
          whatsapp: formData.whatsapp,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser({
        ...user,
        full_name: formData.full_name,
        avatar_url: avatarUrl,
        bio: formData.bio,
        location: formData.location,
        whatsapp: formData.whatsapp,
        updated_at: new Date().toISOString()
      });

      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">{t('settings.signInRequired')}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-8 px-4">
      <div className="mb-4">
        <BackButton label={t('settings.backToProfile')} />
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{t('settings.title')}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
          {/* Avatar */}
          <div className="p-4 md:p-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.profilePicture')}
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar
                  src={avatarPreview || user.avatar_url}
                  alt={user.full_name || 'Profile'}
                  size="lg"
                />
                <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-sm text-gray-600">
                <p>{t('settings.uploadNewPicture')}</p>
                <p className="mt-1">{t('settings.imageRequirements')}</p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="p-4 md:p-6 space-y-4">
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              {t('settings.fullName')}
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* WhatsApp */}
          <div className="p-4 md:p-6 space-y-4">
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
              {t('settings.whatsappNumber')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+1234567890"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {t('settings.whatsappHelp')}
            </p>
          </div>

          {/* Email (Read-only) */}
          <div className="p-4 md:p-6 space-y-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('settings.email')}
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('settings.emailHelp')}
            </p>
          </div>

          {/* Bio */}
          <div className="p-4 md:p-6 space-y-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              {t('settings.bio')}
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder={t('settings.bioPlaceholder')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div className="p-4 md:p-6 space-y-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              {t('settings.location')}
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder={t('settings.locationPlaceholder')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="p-4 md:p-6 bg-gray-50 flex flex-col-reverse md:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm md:text-base font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  {t('settings.saving')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-5 w-5" />
                  {t('settings.saveChanges')}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 bg-white text-gray-700 py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm md:text-base font-medium"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
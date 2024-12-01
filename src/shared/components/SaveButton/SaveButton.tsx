import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { toggleSavedItem } from '../../../lib/queries';
import toast from 'react-hot-toast';

interface SaveButtonProps {
  productId: string;
  initialSaved?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onSaveChange?: (saved: boolean) => void;
}

function SaveButton({ 
  productId, 
  initialSaved = false,
  size = 'md',
  className = '',
  onSaveChange
}: SaveButtonProps) {
  const { t } = useTranslation();
  const { user } = useStore();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    
    if (!user) {
      toast.error(t('auth.signInToSave'));
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const saved = await toggleSavedItem(user.id, productId);
      setIsSaved(saved);
      onSaveChange?.(saved);
      toast.success(saved ? t('products.addedToSaved') : t('products.removedFromSaved'));
    } catch (error) {
      console.error('Error toggling saved item:', error);
      toast.error(t('products.failedToSave'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        rounded-full transition-colors
        ${isSaved ? 'bg-red-100 text-red-600' : 'bg-white/80 text-gray-600 hover:text-red-600'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <Heart 
        className={`${iconSizes[size]} ${isSaved ? 'fill-current' : ''}`} 
      />
    </button>
  );
}

export default SaveButton;
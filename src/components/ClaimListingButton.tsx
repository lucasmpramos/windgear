import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Loader, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClaimListingButtonProps {
  productId: string;
  className?: string;
}

function ClaimListingButton({ productId, className = '' }: ClaimListingButtonProps) {
  const { t } = useTranslation();
  const { user } = useStore();
  const navigate = useNavigate();
  const [claiming, setClaiming] = React.useState(false);

  const handleClaim = async () => {
    if (claiming) return;

    if (user) {
      // If user is logged in, claim the listing directly
      try {
        setClaiming(true);
        const { error } = await supabase
          .from('products')
          .update({
            seller_id: user.id,
            status: 'draft',
            updated_at: new Date().toISOString()
          })
          .eq('id', productId)
          .is('seller_id', null);

        if (error) throw error;

        toast.success(t('products.claimSuccess'));
        navigate('/profile');
      } catch (error) {
        console.error('Error claiming listing:', error);
        toast.error(t('products.claimError'));
      } finally {
        setClaiming(false);
      }
    } else {
      // If user is not logged in, redirect to signup with return URL
      const returnUrl = `/products/${productId}/claim`;
      navigate(`/signup?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  };

  return (
    <button
      onClick={handleClaim}
      disabled={claiming}
      className={`flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 ${className}`}
    >
      {claiming ? (
        <>
          <Loader className="h-5 w-5 animate-spin" />
          <span>{t('products.claiming')}</span>
        </>
      ) : (
        <>
          <UserPlus className="h-5 w-5" />
          <span>{t('products.claimListing')}</span>
        </>
      )}
    </button>
  );
}

export default ClaimListingButton;
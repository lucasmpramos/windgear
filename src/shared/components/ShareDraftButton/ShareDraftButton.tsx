import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareDraftButtonProps {
  productId: string;
  className?: string;
}

function ShareDraftButton({ productId, className = '' }: ShareDraftButtonProps) {
  const { t } = useTranslation();
  const [copying, setCopying] = useState(false);

  const handleShare = async () => {
    if (copying) return;

    try {
      setCopying(true);
      const shareUrl = `${window.location.origin}/products/${productId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('products.draftLinkCopied'));
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error(t('products.draftLinkError'));
    } finally {
      setCopying(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={copying}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-50 ${className}`}
    >
      {copying ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
      <span>{t('products.shareDraftLink')}</span>
    </button>
  );
}

export default ShareDraftButton;
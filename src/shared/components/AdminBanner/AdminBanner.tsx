import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import PreviewButton from '../PreviewButton';
import ShareDraftButton from '../ShareDraftButton';

interface AdminBannerProps {
  className?: string;
  productId?: string;
  onPreview?: () => void;
}

function AdminBanner({ className = '', productId, onPreview }: AdminBannerProps) {
  const { t } = useTranslation();
  const { user } = useStore();

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className={`bg-purple-50 border-l-4 border-purple-500 p-4 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-purple-600" />
        <p className="text-sm text-purple-700">
          {t('common.adminMode')}
        </p>
      </div>
      {productId && (
        <div className="flex items-center gap-2">
          {onPreview && (
            <PreviewButton
              onClick={onPreview}
              size="sm"
              showText={false}
              className="!bg-purple-100 !text-purple-600 hover:!bg-purple-200"
            />
          )}
          <ShareDraftButton
            productId={productId}
            className="!bg-purple-100 !text-purple-600 hover:!bg-purple-200"
          />
        </div>
      )}
    </div>
  );
}

export default AdminBanner;
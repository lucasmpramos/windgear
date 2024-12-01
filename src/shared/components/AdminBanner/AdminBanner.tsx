import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { useStore } from '../../../store/useStore';

interface AdminBannerProps {
  className?: string;
}

function AdminBanner({ className = '' }: AdminBannerProps) {
  const { t } = useTranslation();
  const { user } = useStore();

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className={`bg-purple-50 border-l-4 border-purple-500 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-purple-600" />
        <p className="text-sm text-purple-700">
          {t('common.adminMode')}
        </p>
      </div>
    </div>
  );
}

export default AdminBanner;
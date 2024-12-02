import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

interface DraftBannerProps {
  className?: string;
}

function DraftBanner({ className = '' }: DraftBannerProps) {
  const { t } = useTranslation();

  return (
    <div className={`bg-purple-50 border-l-4 border-purple-500 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-purple-600" />
        <p className="text-sm text-purple-700">
          {t('products.draftBannerText')}
        </p>
      </div>
    </div>
  );
}

export default DraftBanner;
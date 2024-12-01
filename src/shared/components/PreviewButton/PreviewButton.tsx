import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import classNames from 'classnames';

interface PreviewButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

function PreviewButton({ 
  onClick,
  size = 'md',
  showText = true,
  className = ''
}: PreviewButtonProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      onClick={onClick}
      className={classNames(
        'flex items-center gap-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition',
        sizeClasses[size],
        className
      )}
    >
      <Eye className={classNames('text-gray-600', iconSizes[size])} />
      {showText && (
        <span className="font-medium text-gray-700">
          {t('common.preview')}
        </span>
      )}
    </button>
  );
}

export default PreviewButton;
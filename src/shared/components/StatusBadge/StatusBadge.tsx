import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, FileText } from 'lucide-react';

export type ProductStatus = 'available' | 'sold' | 'reserved' | 'draft';

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
  size?: 'sm' | 'md';
}

function StatusBadge({ status, className = '', size = 'md' }: StatusBadgeProps) {
  const { t } = useTranslation();
  const baseClasses = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-full';
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px] md:px-2 md:text-xs' : 'px-3 py-1 text-sm';
  
  const statusClasses = {
    available: 'bg-green-100 text-green-800 border border-green-200',
    sold: 'bg-gray-100 text-gray-800 border border-gray-200',
    reserved: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    draft: 'bg-gray-600 text-white'
  };

  const Icon = status === 'draft' ? FileText : Tag;

  return (
    <span className={`${baseClasses} ${sizeClasses} ${statusClasses[status]} ${className}`}>
      <Icon
        className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${status === 'draft' ? 'text-red-200' : ''}`}
      />
      <span>{t(`products.status.${status}`)}</span>
    </span>
  );
}

export default StatusBadge;
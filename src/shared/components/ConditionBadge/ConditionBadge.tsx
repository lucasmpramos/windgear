import React from 'react';
import { useTranslation } from 'react-i18next';

interface ConditionBadgeProps {
  condition: 'new' | 'used';
  className?: string;
  size?: 'sm' | 'md';
}

function ConditionBadge({ condition, className = '', size = 'md' }: ConditionBadgeProps) {
  const { t } = useTranslation();
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px] md:px-2 md:text-xs' : 'px-3 py-1 text-sm';
  const colorClasses = condition === 'new' 
    ? 'bg-green-100 text-green-800'
    : 'bg-blue-100 text-blue-800';

  return (
    <span className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`}>
      {t(`products.conditions.${condition}`)}
    </span>
  );
}

export default ConditionBadge;
import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

interface ResultsCounterProps {
  filteredCount: number;
  totalCount: number;
  className?: string;
  size?: 'sm' | 'md';
}

function ResultsCounter({ 
  filteredCount, 
  totalCount,
  className = '',
  size = 'md'
}: ResultsCounterProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm'
  };

  return (
    <p className={classNames(
      'text-gray-600',
      sizeClasses[size],
      className
    )}
      aria-live="polite"
      role="status"
    >
      {filteredCount === totalCount ? (
        t('common.showingAllResults', { count: totalCount })
      ) : filteredCount === 0 ? (
        t('common.noResults')
      ) : (
        t('common.showingResults', { 
          filtered: filteredCount,
          total: totalCount 
        })
      )}
    </p>
  );
}

export default ResultsCounter;
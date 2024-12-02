import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { MapPin, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../shared/components/Avatar';

interface SellerInfoProps {
  seller: User;
  className?: string;
}

function SellerInfo({ seller, className = '' }: SellerInfoProps) {
  const { t } = useTranslation();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 mb-4">{t('common.seller')}</h3>
      
      <Link to={`/users/${seller.id}`} className="flex items-start gap-4 group">
        <Avatar
          src={seller.avatar_url}
          alt={seller.full_name || 'Seller'}
          size="md"
          className="flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition">
            {seller.full_name || 'Anonymous User'}
          </p>
          
          <div className="mt-1 space-y-1">
            {seller.location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{seller.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>
                {t('common.joined')} {formatDistanceToNow(new Date(seller.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default SellerInfo;
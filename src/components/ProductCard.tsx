import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { MapPin } from 'lucide-react';
import ImageComponent from './ImageComponent';
import SaveButton from './SaveButton';
import ConditionBadge from './ConditionBadge';
import StatusBadge from './StatusBadge';
import classNames from 'classnames';

interface ProductCardProps {
  product: Product & { isSaved?: boolean };
  variant?: 'grid' | 'list';
  className?: string;
}

function ProductCard({ product, variant = 'list', className = '' }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className={classNames(
        "bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow",
        variant === 'list' ? 'flex' : 'flex-col',
        className
      )}>
        {/* Image */}
        <div className={classNames(
          "bg-gray-100 flex-shrink-0",
          variant === 'list' ? 'w-24 h-24 md:w-32 md:h-32' : 'aspect-square w-full'
        )}>
          <ImageComponent
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className={classNames(
          "flex-1 min-w-0 p-3 relative",
          variant === 'grid' ? 'md:p-4' : 'md:p-3'
        )}>
          {/* Brand & Model */}
          <div className="flex items-center gap-1.5 mb-1">
            {product.brand?.name && (
              <span className="text-xs md:text-sm font-medium text-blue-600 truncate">
                {product.brand.name}
              </span>
            )}
            {product.brand?.name && product.model && (
              <>
                <span className="text-gray-400">·</span>
              </>
            )}
            {product.model && (
              <span className="text-xs md:text-sm text-gray-600 truncate">
                {product.model}
              </span>
            )}
            {(product.brand?.name || product.model) && product.year && (
              <>
                <span className="text-gray-400">·</span>
              </>
            )}
            {product.year && (
              <span className="text-xs md:text-sm text-gray-600">{product.year}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 truncate mb-2">
            {product.title}
          </h3>

          {/* Price & Details */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-bold text-gray-900">
                ${product.price.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <ConditionBadge condition={product.condition} size="sm" />
                <StatusBadge status={product.status} size="sm" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[100px]">{product.location}</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="absolute top-2 right-2">
            <SaveButton
              productId={product.id}
              initialSaved={product.isSaved}
              size="sm"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
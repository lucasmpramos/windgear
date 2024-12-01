import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../../types';
import { MapPin } from 'lucide-react';
import ImageComponent from '../ImageComponent';
import SaveButton from '../SaveButton';
import ConditionBadge from '../ConditionBadge';
import StatusBadge from '../StatusBadge';
import classNames from 'classnames';

export type ProductCardVariant = 'grid' | 'list' | 'compact';

interface ProductCardProps {
  product: Product & { isSaved?: boolean };
  variant?: ProductCardVariant;
  className?: string;
  onSaveChange?: (saved: boolean) => void;
}

function ProductCard({ 
  product, 
  variant = 'grid', 
  className = '',
  onSaveChange 
}: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className={classNames(
        "bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow",
        variant === 'grid' ? 'flex-col' : 'flex',
        variant === 'compact' ? 'p-2' : '',
        className
      )}>
        {/* Image */}
        <div className={classNames(
          "bg-gray-100 flex-shrink-0",
          variant === 'grid' ? 'aspect-square w-full' : 'w-24 h-24 md:w-32 md:h-32',
          variant === 'compact' ? 'w-16 h-16' : ''
        )}>
          <ImageComponent
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className={classNames(
          "flex-1 min-w-0",
          variant === 'compact' ? 'pl-3' : 'p-3 md:p-4',
          "relative"
        )}>
          {/* Brand & Model */}
          <div className="flex items-center gap-1.5 mb-1">
            {product.brand?.name && (
              <span className={classNames(
                "font-medium text-blue-600 truncate",
                variant === 'compact' ? 'text-xs' : 'text-xs md:text-sm'
              )}>
                {product.brand.name}
              </span>
            )}
            {product.brand?.name && product.model && (
              <>
                <span className="text-gray-400">·</span>
              </>
            )}
            {product.model && (
              <span className={classNames(
                "text-gray-600 truncate",
                variant === 'compact' ? 'text-xs' : 'text-xs md:text-sm'
              )}>
                {product.model}
              </span>
            )}
            {(product.brand?.name || product.model) && product.year && (
              <>
                <span className="text-gray-400">·</span>
              </>
            )}
            {product.year && (
              <span className={classNames(
                "text-gray-600",
                variant === 'compact' ? 'text-xs' : 'text-xs md:text-sm'
              )}>
                {product.year}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={classNames(
            "font-medium text-gray-900 truncate",
            variant === 'compact' ? 'text-sm mb-1' : 'text-sm md:text-base mb-2'
          )}>
            {product.title}
          </h3>

          {/* Price & Details */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={classNames(
                "font-bold text-gray-900",
                variant === 'compact' ? 'text-sm' : 'text-sm md:text-base'
              )}>
                ${product.price.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <ConditionBadge condition={product.condition} size="sm" />
                <StatusBadge status={product.status} size="sm" />
              </div>
            </div>
            {variant !== 'compact' && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[100px]">{product.location}</span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className={classNames(
            "absolute",
            variant === 'compact' ? 'top-0 right-0' : 'top-2 right-2'
          )}>
            <SaveButton
              productId={product.id}
              initialSaved={product.isSaved}
              size={variant === 'compact' ? 'sm' : 'md'}
              onSaveChange={onSaveChange}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Star, Eye, MapPin } from 'lucide-react';
import ImageComponent from './ImageComponent';
import SaveButton from './SaveButton';
import ConditionBadge from './ConditionBadge';
import StatusBadge from './StatusBadge';
import classNames from 'classnames';

interface ProductListItemProps {
  product: Product & { isSaved?: boolean };
  className?: string;
}

function ProductListItem({ product, className = '' }: ProductListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const showSecondImage = isHovered && product.images.length > 1;

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className={classNames(
        "flex bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow",
        className
      )}>
        {/* Left: Image */}
        <div
          className="relative w-28 h-28 md:w-40 md:h-40 flex-shrink-0 bg-gray-100"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="absolute inset-0 transition-opacity duration-400 ease-in-out"
            style={{ opacity: showSecondImage ? 0 : 1 }}
          >
            <ImageComponent
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div 
              className="absolute inset-0 transition-opacity duration-400 ease-in-out"
              style={{ opacity: showSecondImage ? 1 : 0 }}
            >
              <ImageComponent
                src={product.images[1]}
                alt={`${product.title} - Second view`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

        </div>

        {/* Right: Content */}
        <div className="flex-1 min-w-0 p-3 md:p-4 relative">
          <div className="flex flex-col h-full justify-between">
            {/* Top Section */}
            <div>
              {/* Brand & Model */}
              <div className="flex items-center gap-1.5 mb-1">
                {product.brand?.name && (
                  <span className="text-xs md:text-sm font-medium text-blue-600">
                    {product.brand.name}
                  </span>
                )}
                {product.model && (
                  <>
                    <span className="text-gray-400">·</span>
                    <span className="text-xs md:text-sm text-gray-600">{product.model}</span>
                  </>
                )}
                {product.year && (
                  <>
                    <span className="text-gray-400">·</span>
                    <span className="text-xs md:text-sm text-gray-600">{product.year}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm md:text-base font-medium text-gray-900 truncate mb-1">
                {product.title}
              </h3>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-sm md:text-lg font-bold text-gray-900">
                  ${product.price.toLocaleString()}
                </span>
                <ConditionBadge condition={product.condition} size="sm" />
                <StatusBadge status={product.status} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{product.location}</span>
              </div>
            </div>
          </div>
          
          {/* Save Button - Top Right */}
          <div className="absolute top-3 right-3">
            <SaveButton
              productId={product.id}
              initialSaved={product.isSaved}
              size="sm"
              className="md:scale-110"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductListItem;
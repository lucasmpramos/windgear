import React from 'react';
import { User } from 'lucide-react';
import classNames from 'classnames';
import ImageComponent from '../ImageComponent';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Avatar({ src, alt = 'User', size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16 md:h-24 md:w-24'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8 md:h-12 md:w-12'
  };

  if (!src) {
    return (
      <div className={classNames(
        'rounded-full bg-gray-100 flex items-center justify-center',
        sizeClasses[size],
        className
      )}>
        <User className={classNames('text-gray-400', iconSizes[size])} />
      </div>
    );
  }

  return (
    <div className={classNames('rounded-full overflow-hidden', sizeClasses[size], className)}>
      <ImageComponent
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        fallbackClassName="h-full w-full flex items-center justify-center bg-gray-100"
      />
    </div>
  );
}

export default Avatar;
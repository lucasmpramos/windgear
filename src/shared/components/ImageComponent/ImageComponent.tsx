import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageComponentProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

function ImageComponent({ src, alt, className = '', fallbackClassName = '' }: ImageComponentProps) {
  const [error, setError] = useState(false);

  // Default fallback image from Pexels
  const defaultFallback = "https://images.pexels.com/photos/1604746/pexels-photo-1604746.jpeg";

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName || className}`}>
        <ImageOff className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  return (
    <img
      src={error ? defaultFallback : src}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      crossOrigin="anonymous"
    />
  );
}

export default ImageComponent;
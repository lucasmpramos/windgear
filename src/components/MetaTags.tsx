import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
  brand?: string;
  condition?: 'new' | 'used';
}

function MetaTags({ 
  title, 
  description, 
  image, 
  url,
  type = 'website',
  price,
  currency = 'USD',
  brand,
  condition
}: MetaTagsProps) {
  const siteUrl = window.location.origin;
  const currentUrl = url || window.location.href;
  const metaImage = image || '/logo.png';
  const metaDescription = description || 'Buy and sell kitesurfing gear with Windgear';
  const fullImageUrl = metaImage.startsWith('http') ? metaImage : `${siteUrl}${metaImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title} | Windgear</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Windgear" />

      {/* Product-specific Open Graph tags */}
      {type === 'product' && (
        <>
          {price && (
            <>
              <meta property="product:price:amount" content={price.toString()} />
              <meta property="product:price:currency" content={currency} />
            </>
          )}
          {brand && <meta property="product:brand" content={brand} />}
          {condition && <meta property="product:condition" content={condition} />}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* WhatsApp specific */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Additional SEO */}
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
}

export default MetaTags;
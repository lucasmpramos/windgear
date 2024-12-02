import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct, deleteProduct } from '../lib/queries';
import { Loader, Share2, Star, MapPin, Clock, ExternalLink, Edit, Trash2, Eye, MessageCircle, FileText } from 'lucide-react';
import ShareDraftButton from '../components/ShareDraftButton';
import DraftBanner from '../components/DraftBanner';
import SellerInfo from '../components/SellerInfo';
import ImageComponent from '../components/ImageComponent';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import SaveButton from '../components/SaveButton';
import ClaimListingButton from '../components/ClaimListingButton';
import ConditionBadge from '../components/ConditionBadge';
import StatusBadge from '../components/StatusBadge';
import { Product } from '../types';
import MetaTags from '../components/MetaTags';
import AdminBanner from '../shared/components/AdminBanner';
import PreviewModal from '../components/PreviewModal';
import PreviewButton from '../shared/components/PreviewButton';
import BackButton from '../components/BackButton';
import ConfirmationDialog from '../shared/components/ConfirmationDialog';
import classNames from 'classnames';

function ProductDetail({ id: propId, previewMode = false }: { id?: string; previewMode?: boolean }) {
  const { t } = useTranslation();
  const { id = propId } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const [product, setProduct] = useState<Product & { isSaved?: boolean; averageRating?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const isOwner = user?.id === product?.seller_id;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getProduct(id, !previewMode);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, previewMode]);

  useEffect(() => {
    setSelectedImage(0);
  }, [product?.id]);

  const handleImageSelect = (index: number) => {
    if (index >= 0 && index < (product?.images.length || 0)) {
      setSelectedImage(index);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.title,
      text: `Check out this ${product.title} on Windgear`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleWhatsAppClick = () => {
    if (!product || !product.seller) return;

    const whatsappNumber = product.seller.whatsapp;
    if (!whatsappNumber) {
      toast.error('Seller has not provided a WhatsApp number');
      return;
    }

    const message = encodeURIComponent(
      `Hi ${product.seller.full_name}, I'm interested in your Windgear listing "${product.title}". Can we chat about it?\n\n${window.location.href}`
    );
    
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleDelete = async (confirmed?: boolean) => {
    if (!product || !user || deleting) return;

    if (!confirmed) {
      setShowDeleteConfirmation(true);
      return;
    }

    try {
      setDeleting(true);
      await deleteProduct(product.id, user.id);
      toast.success('Product deleted successfully');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {error || t('products.notFound')}
        </h2>
        <Link
          to="/products"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {t('products.backToProducts')}
        </Link>
      </div>
    );
  }

  // Create a rich description for social sharing
  const socialDescription = `${product.condition.toUpperCase()} ${product.brand?.name || ''} ${
    product.model ? `${product.model} ` : ''
  }${product.year ? `(${product.year}) ` : ''}- $${product.price.toLocaleString()}. Located in ${
    product.location
  }. ${product.description.slice(0, 150)}${product.description.length > 150 ? '...' : ''}`;

  return (
    <>
      <MetaTags 
        title={product.title}
        description={socialDescription}
        image={product.images[0]}
        type="product"
        price={product.price}
        currency="USD"
        brand={product.brand?.name}
        condition={product.condition}
      />

      <div>
        <div className="mb-4">
          <BackButton />
        </div>

        {/* Admin Banner */}
        {user?.is_admin && !previewMode && (
          <AdminBanner
            productId={product.id}
            onPreview={() => setShowPreviewModal(true)}
            className="mb-4"
          />
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {product.status === 'draft' && !product.seller_id && !user?.is_admin && (
              <DraftBanner className="m-4" />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="space-y-2 p-2 md:p-4 lg:border-r border-gray-200">
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
                <ImageComponent
                  src={product.images[selectedImage]}
                  alt={`${product.title} - Image ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => handleImageSelect(index)}
                      className={classNames(
                        'aspect-square rounded-lg overflow-hidden bg-gray-100',
                        selectedImage === index ? 'ring-2 ring-blue-600' : ''
                      )}
                    >
                      <ImageComponent
                        src={image}
                        alt={`${product.title} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3 md:p-6 space-y-4">
              <div>
                <div className="mb-3 md:mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    {product.brand?.name && (
                      <span className="text-base md:text-xl font-semibold text-blue-600 truncate flex-shrink-0">
                        {product.brand?.name}
                      </span>
                    )}
                    {product.brand?.website && (
                      <a
                        href={product.brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('products.visitBrandWebsite')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    {product.model && (
                      <span className="text-sm md:text-base font-medium">{product.model}</span>
                    )}
                    {product.year && (
                      <>
                        <span className="text-gray-400">·</span>
                        <span className="text-sm md:text-base">{product.year}</span>
                      </>
                    )}
                  </div>
                </div>

                <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-3">{product.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {product.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Eye className="h-4 w-4" />
                    {product.views || 0}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg md:text-2xl font-bold text-gray-900">
                    ${product.price.toLocaleString()}
                  </span>
                  <ConditionBadge condition={product.condition} />
                  <StatusBadge status={product.status} />
                </div>
              </div>

              {product.averageRating !== null && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 md:h-5 md:w-5 ${
                          index < Math.round(product.averageRating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm md:text-base text-gray-600">
                    ({product.reviews.length} reviews)
                  </span>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <p className="text-sm md:text-base text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>

              <div className="flex gap-2 pt-2">
                {isOwner && !previewMode ? (
                  <>
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-sm md:text-base">{t('products.editListing')}</span>
                    </Link>
                    <button
                      onClick={() => handleDelete()}
                      disabled={deleting}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-sm md:text-base">
                        {deleting ? t('common.deleting') : t('common.delete')}
                      </span>
                    </button>
                  </>
                ) : user?.is_admin && !isOwner ? (
                  <>
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-sm md:text-base">{t('products.editListing')}</span>
                    </Link>
                    <button
                      onClick={() => handleDelete()}
                      disabled={deleting}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-sm md:text-base">
                        {deleting ? t('common.deleting') : t('common.delete')}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleWhatsAppClick}
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-sm md:text-base">{t('products.contactWhatsApp')}</span>
                    </button>
                    <SaveButton
                      productId={product.id}
                      initialSaved={product.isSaved}
                      size="lg"
                      className="!bg-white border border-gray-300"
                    />
                    <button
                      onClick={handleShare}
                      className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      title={t('common.share')}
                    >
                      <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Seller Info or Claim Button */}
              <div className="mt-6">
                {product.seller ? (
                  <SellerInfo seller={product.seller} />
                ) : product.status === 'draft' ? (
                  <ClaimListingButton productId={product.id} />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-center gap-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-600">No seller assigned</p>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="hidden md:block border-t border-gray-200 mt-6 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('products.reviews')}</h2>
                {product.reviews.length === 0 ? (
                  <p className="text-gray-600">{t('products.noReviews')}</p>
                ) : (
                  <div className="space-y-6">
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${
                                  index < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-600 text-sm">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <PreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          productId={product.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {
          setShowDeleteConfirmation(false);
          handleDelete(true);
        }}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmText="Delete"
        intent="danger"
        loading={deleting}
      />
    </>
  );
}

export default ProductDetail;
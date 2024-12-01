import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Eye, X } from 'lucide-react';
import ProductDetail from '../pages/ProductDetail';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

function PreviewModal({ isOpen, onClose, productId }: PreviewModalProps) {
  const { t } = useTranslation();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden bg-white text-left align-middle shadow-xl transition-all rounded-xl">
                <div className="sticky top-0 z-50 bg-blue-50 p-4 flex items-center gap-3">
                  <Eye className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p className="text-blue-700">
                    {t('common.previewMode')}
                  </p>
                  <button
                    type="button"
                    className="ml-auto rounded-md bg-white/80 p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[85vh] py-8">
                  <ProductDetail id={productId} previewMode />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default PreviewModal;
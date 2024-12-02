import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';
import classNames from 'classnames';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  intent?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  intent = 'danger',
  loading = false
}: ConfirmationDialogProps) {
  const { t } = useTranslation();

  const intentClasses = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 active:bg-yellow-800',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800'
  };

  const iconClasses = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className={classNames('p-2 rounded-full bg-opacity-10', {
                    'bg-red-100': intent === 'danger',
                    'bg-yellow-100': intent === 'warning',
                    'bg-blue-100': intent === 'info'
                  })}>
                    <AlertTriangle className={classNames('h-7 w-7', iconClasses[intent])} />
                  </div>

                  <div className="flex-1">
                    <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                      {title}
                    </Dialog.Title>
                    <Dialog.Description className="text-base text-gray-600">
                      {message}
                    </Dialog.Description>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                  >
                    {cancelText || t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={classNames(
                      'px-5 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center gap-2',
                      intentClasses[intent]
                    )}
                  >
                    {loading && <Loader className="h-4 w-4 animate-spin" />}
                    {confirmText || t('common.confirm')}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default ConfirmationDialog;
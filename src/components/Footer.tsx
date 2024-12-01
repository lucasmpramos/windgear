import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-8 md:mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3 md:space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src="https://res.cloudinary.com/djz1gvdj5/image/upload/v1732582695/logo-full-white_t7q7f8.png" alt="Windgear" className="h-8" />
            </Link>
            <p className="text-xs md:text-sm">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-1.5 md:space-y-2">
              <li><Link to="/products" className="hover:text-white">{t('footer.browseGear')}</Link></li>
              <li><Link to="/products/new" className="hover:text-white">{t('footer.sellEquipment')}</Link></li>
              <li><Link to="/about" className="hover:text-white">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contact" className="hover:text-white">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-1.5 md:space-y-2">
              <li><Link to="/privacy" className="hover:text-white">{t('footer.privacyPolicy')}</Link></li>
              <li><Link to="/terms" className="hover:text-white">{t('footer.termsOfService')}</Link></li>
              <li><Link to="/shipping" className="hover:text-white">{t('footer.shippingInfo')}</Link></li>
              <li><Link to="/returns" className="hover:text-white">{t('footer.returns')}</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4">{t('footer.connectWithUs')}</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white">
                <Facebook className="h-5 w-5 md:h-6 md:w-6" />
              </a>
              <a href="#" className="hover:text-white">
                <Twitter className="h-5 w-5 md:h-6 md:w-6" />
              </a>
              <a href="#" className="hover:text-white">
                <Instagram className="h-5 w-5 md:h-6 md:w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 md:mt-12 pt-4 md:pt-8 text-xs md:text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Windgear. {t('footer.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
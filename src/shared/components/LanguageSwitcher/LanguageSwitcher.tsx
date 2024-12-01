import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '@headlessui/react';
import { Globe, Check } from 'lucide-react';
import classNames from 'classnames';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' }
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition p-2 rounded-lg hover:bg-gray-50">
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium">{i18n.language.toUpperCase()}</span>
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
        {languages.map(({ code, name }) => (
          <Menu.Item key={code}>
            {({ active }) => (
              <button
                onClick={() => i18n.changeLanguage(code)}
                className={classNames(
                  'w-full text-left px-4 py-2 text-sm flex items-center justify-between',
                  active ? 'bg-gray-50 text-blue-600' : 'text-gray-700'
                )}
              >
                <span>{name}</span>
                {i18n.language === code && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}

export default LanguageSwitcher;
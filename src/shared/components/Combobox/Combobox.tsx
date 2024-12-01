import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Combobox as HeadlessCombobox } from '@headlessui/react';
import classNames from 'classnames';

export interface Option {
  id: string;
  name?: string;
  translationKey?: string;
}

interface ComboboxProps {
  options: Option[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  multiple?: boolean;
  displayValue?: (selectedOptions: Option[]) => string;
}

function Combobox({
  options,
  selectedIds,
  onChange,
  placeholder = 'Select options...',
  label,
  className = '',
  multiple = false,
  displayValue
}: ComboboxProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  // Transform options to include translated names
  const transformedOptions = useMemo(() => {
    return options.map(option => ({
      ...option,
      displayName: option.translationKey ? t(option.translationKey) : option.name || option.id
    }));
  }, [options, t]);

  const filteredOptions = query === ''
    ? transformedOptions
    : transformedOptions.filter((option) =>
        (option.displayName || '')
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      );

  const selectedOptions = transformedOptions.filter(option => selectedIds.includes(option.id));

  const getDisplayValue = () => {
    if (selectedOptions.length === 0) return '';
    if (!multiple) {
      if (displayValue) {
        return displayValue(selectedOptions);
      }
      return selectedOptions[0]?.displayName || '';
    }
    return `${selectedOptions.length} selected`;
  };

  const handleSelect = (selected: Option | Option[]) => {
    if (multiple) {
      const selectedArray = Array.isArray(selected) ? selected : [selected];
      onChange(selectedArray.map(option => option.id || ''));
    } else {
      // For single select, handle both array and single option cases
      const option = Array.isArray(selected) ? selected[selected.length - 1] : selected;
      onChange([option?.id || '']);
    }
  };

  return (
    <div className={className}>
      {label && (
        <div className="text-xs md:text-sm font-medium text-gray-900 mb-2">
          {label}
        </div>
      )}
      <HeadlessCombobox
        value={multiple ? selectedOptions : selectedOptions[0] || null}
        onChange={handleSelect}
        multiple={multiple}
      >
        <div className="relative">
          <div className="relative w-full">
            <HeadlessCombobox.Input
              className="w-full rounded-lg border border-gray-300 px-10 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={placeholder}
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(selected: Option | Option[]) => {
                if (!selected) return '';
                if (Array.isArray(selected)) {
                  return selected.length > 0 ? selected[0].displayName || '' : '';
                }
                return selected.displayName || '';
              }}
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </HeadlessCombobox.Button>
          </div>
          <HeadlessCombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                {t('common.noResults')}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <HeadlessCombobox.Option
                  key={option.id}
                  value={option}
                  className={({ active }) =>
                    classNames(
                      'relative cursor-pointer select-none py-2.5 pl-10 pr-4',
                      active ? 'bg-blue-600 text-white' : 'text-gray-900'
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span className={classNames('block truncate text-base', selected ? 'font-medium' : 'font-normal')}>
                        {option.displayName}
                      </span>
                      {selected && (
                        <span
                          className={classNames(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-white' : 'text-blue-600'
                          )}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </HeadlessCombobox.Option>
              ))
            )}
          </HeadlessCombobox.Options>
        </div>
      </HeadlessCombobox>
    </div>
  );
}

export default Combobox;
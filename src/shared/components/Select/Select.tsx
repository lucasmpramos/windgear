import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import classNames from 'classnames';

export interface Option {
  id: string;
  name?: string;
  translationKey?: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  error?: string;
}

function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  className = '',
  error
}: SelectProps) {
  const { t } = useTranslation();

  // Transform options to include translated names
  const transformedOptions = useMemo(() => {
    return options.map(option => ({
      ...option,
      displayName: option.translationKey ? t(option.translationKey) : option.name
    }));
  }, [options, t]);

  const selectedOption = transformedOptions.find(option => option.id === value);

  return (
    <div className={className}>
      {label && (
        <div className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </div>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            <span className={classNames(
              "block truncate",
              !selectedOption && "text-gray-500"
            )}>
              {selectedOption?.name || placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.id}
                value={option.id}
                className={({ active }) =>
                  classNames(
                    'relative cursor-pointer select-none py-2.5 pl-10 pr-4',
                    active ? 'bg-blue-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ selected, active }) => (
                  <>
                    <span className={classNames('block truncate', selected ? 'font-medium' : 'font-normal')}>
                      {option.name}
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
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export default Select;
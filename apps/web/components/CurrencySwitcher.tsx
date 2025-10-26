'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/pro-regular-svg-icons';
import { currencies, defaultCurrency, type Currency } from '@/lib/currency';
import { Input } from '@/components/ui/input';

const CurrencySwitcher = () => {
  const [currentCurrency, setCurrentCurrency] =
    useState<Currency>(defaultCurrency);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCurrencyChange = (currency: Currency) => {
    setCurrentCurrency(currency);
    // In a real app, you would:
    // 1. Update currency context/state
    // 2. Store preference in cookies/localStorage
    // 3. Fetch exchange rates if needed
    // 4. Update all prices on the page
    console.log('Currency changed to:', currency);
    setSearchQuery('');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-sm font-inter h-10 px-3 bg-transparent"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg flex-shrink-0">
              {currentCurrency.flag}
            </span>
            <span className="truncate">
              {currentCurrency.code} {currentCurrency.symbol}
            </span>
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="text-xs ml-2 flex-shrink-0"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-semibold">
          Select Currency
        </DropdownMenuLabel>
        <div className="px-2 py-2">
          <Input
            type="search"
            placeholder="Search currencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {filteredCurrencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => handleCurrencyChange(currency)}
              className="cursor-pointer flex items-center gap-3 py-2"
            >
              <span className="text-xl">{currency.flag}</span>
              <div className="flex-1">
                <p className="font-medium">
                  {currency.code} {currency.symbol}
                </p>
                <p className="text-xs text-gray-500">{currency.name}</p>
              </div>
              {currentCurrency.code === currency.code && (
                <span className="text-sage-green font-bold">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySwitcher;

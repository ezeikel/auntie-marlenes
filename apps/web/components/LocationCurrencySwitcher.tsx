'use client';

import { faChevronDown, faGlobe } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useLocation } from '@/contexts/LocationContext';
import { allCountries, priorityCountries } from '@/lib/location';

const LocationCurrencySwitcher = () => {
  const { country, setCountry, isLoading } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.currency.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCountryChange = (newCountry: typeof country) => {
    setCountry(newCountry);
    setSearchQuery('');
  };

  // Show loading state during SSR and initial client render to prevent hydration mismatch
  if (!isMounted || isLoading) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between text-sm font-inter h-10 px-3 bg-transparent"
        disabled
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faGlobe} className="text-sm" />
          <span className="truncate">Loading...</span>
        </div>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-sm font-inter h-10 px-3 bg-transparent"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg flex-shrink-0">{country.flag}</span>
            <span className="truncate hidden lg:inline">
              {country.code} ({country.currency.code})
            </span>
            <span className="truncate lg:hidden">{country.code}</span>
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="text-xs ml-2 flex-shrink-0"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-semibold">
          Select Location & Currency
        </DropdownMenuLabel>
        <div className="px-2 py-2">
          <Input
            type="search"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <DropdownMenuSeparator />

        {/* Priority Countries Section */}
        {searchQuery === '' && (
          <>
            <div className="px-2 py-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Popular Destinations
              </p>
            </div>
            {priorityCountries.map((c) => (
              <DropdownMenuItem
                key={c.code}
                onClick={() => handleCountryChange(c)}
                className="cursor-pointer flex items-center gap-3 py-2.5 px-3"
              >
                <span className="text-xl">{c.flag}</span>
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500">
                    {c.currency.code} - {c.currency.name}
                  </p>
                </div>
                {country.code === c.code && (
                  <span className="text-sage-green font-bold">✓</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                All Countries
              </p>
            </div>
          </>
        )}

        {/* All Countries Section */}
        <div className="max-h-64 overflow-y-auto">
          {filteredCountries.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No countries found
            </div>
          ) : (
            filteredCountries.map((c) => {
              // Skip priority countries in the "All Countries" section if no search
              if (
                searchQuery === '' &&
                priorityCountries.some((pc) => pc.code === c.code)
              ) {
                return null;
              }

              return (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => handleCountryChange(c)}
                  className="cursor-pointer flex items-center gap-3 py-2.5 px-3"
                >
                  <span className="text-xl">{c.flag}</span>
                  <div className="flex-1">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">
                      {c.currency.code} - {c.currency.name}
                    </p>
                  </div>
                  {country.code === c.code && (
                    <span className="text-sage-green font-bold">✓</span>
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationCurrencySwitcher;

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CountryInfo } from '@/lib/location';
import type { Currency } from '@/lib/currency';
import {
  getDefaultCountry,
  getCountryByCode,
  getCurrencyForCountry,
} from '@/lib/location';
import { updateCartCountryCode, setCountryCookie } from '@/app/actions';

type LocationContextType = {
  country: CountryInfo;
  currency: Currency;
  setCountry: (country: CountryInfo) => void;
  setCurrency: (currency: Currency) => void;
  isLoading: boolean;
};

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

const STORAGE_KEY_COUNTRY = 'auntie-marlenes-country';
const STORAGE_KEY_CURRENCY = 'auntie-marlenes-currency';

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [country, setCountryState] = useState<CountryInfo>(getDefaultCountry());
  const [currency, setCurrencyState] = useState<Currency>(
    getDefaultCountry().currency,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        // Load saved country
        const savedCountryCode = localStorage.getItem(STORAGE_KEY_COUNTRY);
        if (savedCountryCode) {
          const savedCountry = getCountryByCode(savedCountryCode);
          if (savedCountry) {
            setCountryState(savedCountry);
            // If no custom currency is saved, use the country's default currency
            const savedCurrencyCode =
              localStorage.getItem(STORAGE_KEY_CURRENCY);
            if (!savedCurrencyCode) {
              setCurrencyState(savedCountry.currency);
            }

            // Sync cookie to match localStorage
            try {
              await setCountryCookie(savedCountry.code);
            } catch (error) {
              console.error('Error syncing country cookie on mount:', error);
            }
          }
        }

        // Load saved currency (if user manually changed it)
        const savedCurrencyCode = localStorage.getItem(STORAGE_KEY_CURRENCY);
        if (savedCurrencyCode) {
          const savedCurrency = getCurrencyForCountry(savedCurrencyCode);
          setCurrencyState(savedCurrency);
        }
      } catch (error) {
        console.error('Error loading location preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedPreferences();
  }, []);

  // Update country and sync with Shopify cart
  const setCountry = async (newCountry: CountryInfo) => {
    console.log('[LocationContext] Setting country:', {
      from: country.code,
      to: newCountry.code,
      currency: newCountry.currency.code,
    });

    setCountryState(newCountry);
    setCurrencyState(newCountry.currency); // Auto-update currency when country changes

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY_COUNTRY, newCountry.code);
      localStorage.setItem(STORAGE_KEY_CURRENCY, newCountry.currency.code);
      console.log('[LocationContext] Saved to localStorage:', newCountry.code);
    } catch (error) {
      console.error('Error saving country preference:', error);
    }

    // Set cookie for server-side country detection
    try {
      await setCountryCookie(newCountry.code);
      console.log('[LocationContext] Set cookie:', newCountry.code);
    } catch (error) {
      console.error('Error setting country cookie:', error);
    }

    // Update Shopify cart buyer identity
    try {
      await updateCartCountryCode(newCountry.code);
      console.log('[LocationContext] Updated cart country:', newCountry.code);
    } catch (error) {
      console.error('Error updating cart buyer identity:', error);
    }

    // Refresh server components to re-render with new country
    console.log('[LocationContext] Calling router.refresh()');
    router.refresh();
  };

  // Update currency only (independent of country)
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, newCurrency.code);
    } catch (error) {
      console.error('Error saving currency preference:', error);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        country,
        currency,
        setCountry,
        setCurrency,
        isLoading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// Hook to use location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

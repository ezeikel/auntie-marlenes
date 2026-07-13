'use client';

import { useRouter } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { setCountryCookie, updateCartCountryCode } from '@/app/actions';
import { TRACKING_EVENTS } from '@/constants/events';
import type { Currency } from '@/lib/currency';
import type { CountryInfo } from '@/lib/location';
import {
  getCountryByCode,
  getCurrencyForCountry,
  getDefaultCountry,
} from '@/lib/location';
import { logger } from '@/lib/logger';
import { useAnalytics } from '@/utils/analytics-client';

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
  const { track } = useAnalytics();

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
  const setCountry = useCallback(
    async (newCountry: CountryInfo) => {
      setCountryState((prev) => {
        const previousCountry = prev.code;

        console.log('[LocationContext] Setting country:', {
          from: previousCountry,
          to: newCountry.code,
          currency: newCountry.currency.code,
        });

        // Track country change
        track(TRACKING_EVENTS.COUNTRY_CHANGED, {
          previous_country: previousCountry,
          new_country: newCountry.code,
          previous_currency: prev.currency.code,
          new_currency: newCountry.currency.code,
        });

        return newCountry;
      });
      setCurrencyState(newCountry.currency); // Auto-update currency when country changes

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY_COUNTRY, newCountry.code);
        localStorage.setItem(STORAGE_KEY_CURRENCY, newCountry.currency.code);
        console.log(
          '[LocationContext] Saved to localStorage:',
          newCountry.code,
        );
      } catch (error) {
        console.error('Error saving country preference:', error);
        logger.error(
          'Failed to save country preference to localStorage',
          error instanceof Error ? error : new Error('Unknown error'),
          { countryCode: newCountry.code },
        );
      }

      // Set cookie for server-side country detection
      try {
        await setCountryCookie(newCountry.code);
        console.log('[LocationContext] Set cookie:', newCountry.code);
      } catch (error) {
        console.error('Error setting country cookie:', error);
        logger.error(
          'Failed to set country cookie',
          error instanceof Error ? error : new Error('Unknown error'),
          { countryCode: newCountry.code },
        );
      }

      // Update Shopify cart buyer identity
      try {
        await updateCartCountryCode(newCountry.code);
        console.log('[LocationContext] Updated cart country:', newCountry.code);

        logger.info('Country changed successfully', {
          newCountry: newCountry.code,
        });
      } catch (error) {
        console.error('Error updating cart buyer identity:', error);
        logger.error(
          'Failed to update cart buyer identity',
          error instanceof Error ? error : new Error('Unknown error'),
          { countryCode: newCountry.code },
        );
      }

      // Refresh server components to re-render with new country
      console.log('[LocationContext] Calling router.refresh()');
      router.refresh();
    },
    [router, track],
  );

  // Update currency only (independent of country)
  const setCurrency = useCallback(
    (newCurrency: Currency) => {
      setCurrencyState((prev) => {
        // Track currency change
        track(TRACKING_EVENTS.CURRENCY_CHANGED, {
          previous_currency: prev.code,
          new_currency: newCurrency.code,
          country: country.code,
        });

        return newCurrency;
      });

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY_CURRENCY, newCurrency.code);

        logger.info('Currency changed successfully', {
          newCurrency: newCurrency.code,
        });
      } catch (error) {
        console.error('Error saving currency preference:', error);
        logger.error(
          'Failed to save currency preference to localStorage',
          error instanceof Error ? error : new Error('Unknown error'),
          { currencyCode: newCurrency.code },
        );
      }
    },
    [country.code, track],
  );

  const value = useMemo(
    () => ({ country, currency, setCountry, setCurrency, isLoading }),
    [country, currency, setCountry, setCurrency, isLoading],
  );

  return (
    <LocationContext.Provider value={value}>
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

'use client';

import { useEffect, useState } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import { formatCurrency } from '@/lib/currency';

type DynamicProductPriceProps = {
  productHandle: string;
  staticPrice: number;
  staticCurrencyCode: string;
  compareAtPrice?: number;
  className?: string;
};

/**
 * PPR-friendly component that shows localized pricing.
 *
 * - On initial render (SSR/static), shows the static price (user's country from cookie)
 * - On client, if user switches to a different currency, fetches localized price from API
 * - When switching back to the static currency, clears localized state and shows static
 */
const DynamicProductPrice = ({
  productHandle,
  staticPrice,
  staticCurrencyCode,
  compareAtPrice,
  className = '',
}: DynamicProductPriceProps) => {
  const { country, isLoading: locationLoading } = useLocation();
  const [localizedPrice, setLocalizedPrice] = useState<{
    price: number;
    currencyCode: string;
    compareAtPrice?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch localized price if user's country differs from static
  useEffect(() => {
    // Skip if location is still loading
    if (locationLoading) {
      return;
    }

    // If user's currency matches the static currency, clear any localized price and use static
    if (country.currency.code === staticCurrencyCode) {
      if (localizedPrice !== null) {
        setLocalizedPrice(null);
      }
      return;
    }

    const fetchLocalizedPrice = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/product/${productHandle}/price?country=${country.code}`,
        );
        if (response.ok) {
          const data = await response.json();
          setLocalizedPrice({
            price: data.price,
            currencyCode: data.currencyCode,
            compareAtPrice: data.compareAtPrice,
          });
        }
      } catch (error) {
        console.error('Failed to fetch localized price:', error);
        // Keep showing static price on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocalizedPrice();
  }, [
    country.code,
    country.currency.code,
    locationLoading,
    productHandle,
    staticCurrencyCode,
  ]);

  // Use localized price if available, otherwise static
  const displayPrice = localizedPrice?.price ?? staticPrice;
  const displayCurrency = localizedPrice?.currencyCode ?? staticCurrencyCode;
  const displayCompareAt = localizedPrice?.compareAtPrice ?? compareAtPrice;

  const showComparePrice = displayCompareAt && displayCompareAt > displayPrice;

  return (
    <div className={className}>
      <p className="text-3xl font-bold text-cocoa">
        {isLoading ? (
          <span className="animate-pulse">
            {formatCurrency(staticPrice, staticCurrencyCode)}
          </span>
        ) : (
          formatCurrency(displayPrice, displayCurrency)
        )}
      </p>
      <p
        className={`text-lg text-gray-500 line-through ${!showComparePrice ? 'hidden' : ''}`}
      >
        {showComparePrice
          ? formatCurrency(displayCompareAt, displayCurrency)
          : ''}
      </p>
    </div>
  );
};

export default DynamicProductPrice;

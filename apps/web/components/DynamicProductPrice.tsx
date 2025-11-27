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
 * - On initial render (SSR/static), shows the static price (default GB/GBP)
 * - On client, if user's country differs, fetches localized price from API
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
    // Skip if location is still loading or if country matches default
    if (locationLoading || country.code === 'GB') {
      return;
    }

    const fetchLocalizedPrice = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/product/${productHandle}/price?country=${country.code}`
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
  }, [country.code, locationLoading, productHandle]);

  // Use localized price if available, otherwise static
  const displayPrice = localizedPrice?.price ?? staticPrice;
  const displayCurrency = localizedPrice?.currencyCode ?? staticCurrencyCode;
  const displayCompareAt = localizedPrice?.compareAtPrice ?? compareAtPrice;

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
      {displayCompareAt && displayCompareAt > displayPrice && (
        <p className="text-lg text-gray-500 line-through">
          {formatCurrency(displayCompareAt, displayCurrency)}
        </p>
      )}
    </div>
  );
};

export default DynamicProductPrice;



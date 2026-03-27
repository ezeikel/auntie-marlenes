'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import ProductListing from '@/components/ProductListing/ProductListing';
import { Product } from '@/lib/constants';
import { useAnalytics } from '@/utils/analytics-client';
import { TRACKING_EVENTS } from '@/constants/events';

type DynamicProductListingProps = {
  initialProducts: Product[];
  title: string;
  breadcrumb: { label: string; href: string }[];
  staticCountry: string; // The country used for initial server-side fetch
  category?: string;
  query?: string;
  onSale?: boolean;
  sortKey?:
    | 'TITLE'
    | 'PRICE'
    | 'CREATED_AT'
    | 'BEST_SELLING'
    | 'RELEVANCE'
    | undefined;
  reverse?: boolean;
};

/**
 * PPR-friendly component that shows localized product listings.
 *
 * - On initial render (SSR/static), shows the static products (user's country from cookie)
 * - On client, if user switches to a different country, fetches localized products from API
 * - When switching back to the static country, clears localized state and shows static
 */
const DynamicProductListing = ({
  initialProducts,
  title,
  breadcrumb,
  staticCountry,
  category,
  query,
  onSale = false,
  sortKey = 'BEST_SELLING',
  reverse = false,
}: DynamicProductListingProps) => {
  const { country, isLoading: locationLoading } = useLocation();
  const [localizedProducts, setLocalizedProducts] = useState<Product[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch localized products if user's country differs from static
  useEffect(() => {
    console.log('[DynamicProductListing] useEffect:', {
      title,
      locationLoading,
      currentCountry: country.code,
      staticCountry,
      hasLocalizedProducts: localizedProducts !== null,
    });

    // Skip if location is still loading
    if (locationLoading) {
      return;
    }

    // If user's country matches the static country, clear any localized products and use static
    if (country.code === staticCountry) {
      if (localizedProducts !== null) {
        console.log(
          '[DynamicProductListing] Country matches static, clearing localized',
        );
        setLocalizedProducts(null);
      }
      return;
    }

    console.log(
      '[DynamicProductListing] Country differs, fetching localized products',
    );
    const fetchLocalizedProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          country: country.code,
          sortKey: sortKey || 'BEST_SELLING',
          reverse: reverse.toString(),
          first: '50',
          ...(category && { category }),
          ...(query && { query }),
          ...(onSale && { onSale: 'true' }),
        });

        const response = await fetch(`/api/products/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          console.log(
            '[DynamicProductListing] Fetched localized products:',
            data.length,
            'products',
          );
          setLocalizedProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch localized products:', error);
        // Keep showing static products on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocalizedProducts();
  }, [
    country.code,
    locationLoading,
    staticCountry,
    category,
    query,
    onSale,
    sortKey,
    reverse,
  ]);

  const { track } = useAnalytics();
  const hasTrackedRef = useRef<string | null>(null);

  // Use localized products if available, otherwise static
  const displayProducts = localizedProducts ?? initialProducts;

  // Track product list impression when products are displayed
  useEffect(() => {
    if (displayProducts.length === 0) return;

    // Create a fingerprint to avoid re-tracking the same list
    const fingerprint = displayProducts
      .slice(0, 5)
      .map((p) => p.id)
      .join(',');
    if (hasTrackedRef.current === fingerprint) return;
    hasTrackedRef.current = fingerprint;

    track(TRACKING_EVENTS.PRODUCT_LIST_VIEWED, {
      list_name: title.toLowerCase().replace(/\s+/g, '_'),
      product_ids: displayProducts.slice(0, 20).map((p) => p.id),
      product_count: displayProducts.length,
    });
  }, [displayProducts, title, track]);

  return (
    <div className={isLoading ? 'opacity-70 transition-opacity' : ''}>
      <ProductListing
        products={displayProducts}
        title={title}
        breadcrumb={breadcrumb}
      />
    </div>
  );
};

export default DynamicProductListing;

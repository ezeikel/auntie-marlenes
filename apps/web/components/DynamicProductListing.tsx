'use client';

import { useEffect, useState } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import ProductListing from '@/components/ProductListing/ProductListing';
import { Product } from '@/lib/constants';

type DynamicProductListingProps = {
  initialProducts: Product[];
  title: string;
  breadcrumb: { label: string; href: string }[];
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
 * - On initial render (SSR/static), shows the static products (default GB/GBP)
 * - On client, if user's country differs, fetches localized products from API
 */
const DynamicProductListing = ({
  initialProducts,
  title,
  breadcrumb,
  category,
  query,
  onSale = false,
  sortKey = 'BEST_SELLING',
  reverse = false,
}: DynamicProductListingProps) => {
  const { country, isLoading: locationLoading } = useLocation();
  const [localizedProducts, setLocalizedProducts] = useState<Product[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch localized products if user's country differs from static
  useEffect(() => {
    // Skip if location is still loading or if country matches default
    if (locationLoading || country.code === 'GB') {
      return;
    }

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
    category,
    query,
    onSale,
    sortKey,
    reverse,
  ]);

  // Use localized products if available, otherwise static
  const displayProducts = localizedProducts ?? initialProducts;

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

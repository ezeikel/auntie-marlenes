import { after } from 'next/server';
import DynamicProductListing from '@/components/DynamicProductListing';
import { searchProducts } from '@/app/actions';
import { cacheLife, cacheTag } from 'next/cache';
import { getServerCountry, getServerUserId } from '@/lib/server-location';
import { track } from '@/utils/analytics-server';
import { TRACKING_EVENTS } from '@/constants/events';

type SaleProps = {
  searchParams: Promise<{ sort?: string }>;
};

// Cached component that fetches sale products based on sort and country
// Both sort and country become part of the cache key automatically
async function CachedSaleProducts({
  sort,
  country,
  userId,
}: {
  sort?: string;
  country: string;
  userId?: string | null;
}) {
  'use cache';
  cacheLife('days'); // Cache for 1 day - products don't change often
  cacheTag('sale-products'); // Tag for webhook invalidation

  // Map sort parameter to Shopify sortKey
  let sortKey:
    | 'TITLE'
    | 'PRICE'
    | 'CREATED_AT'
    | 'BEST_SELLING'
    | 'RELEVANCE'
    | undefined;
  let reverse = false;

  switch (sort) {
    case 'price-low':
      sortKey = 'PRICE';
      reverse = false;
      break;
    case 'price-high':
      sortKey = 'PRICE';
      reverse = true;
      break;
    case 'newest':
      sortKey = 'CREATED_AT';
      reverse = true;
      break;
    default:
      sortKey = 'BEST_SELLING';
  }

  // Fetch products on sale (compareAtPrice > price) with user's country for pricing
  const products = await searchProducts({
    sortKey,
    reverse,
    first: 250,
    onSale: true, // Filter for products with compareAtPrice
    countryCode: country,
    userId, // Pass userId for analytics tracking
  });

  return (
    <div className="bg-white min-h-screen">
      <DynamicProductListing
        initialProducts={products}
        title="Sale"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Sale', href: '/sale' },
        ]}
        staticCountry={country}
        onSale={true}
        sortKey={sortKey}
        reverse={reverse}
      />
    </div>
  );
}

// Main component that extracts searchParams and gets user country
const Sale = async ({ searchParams }: SaleProps) => {
  const params = await searchParams;
  const country = await getServerCountry();
  const userId = await getServerUserId();

  // Track collection view (non-blocking, outside cache scope)
  after(async () => {
    await track(
      TRACKING_EVENTS.COLLECTION_VIEWED,
      {
        collection_handle: 'sale',
        collection_title: 'Sale',
        source: 'sale',
      },
      userId,
    );
  });

  return (
    <CachedSaleProducts sort={params.sort} country={country} userId={userId} />
  );
};

export default Sale;

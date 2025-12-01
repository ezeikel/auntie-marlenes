import DynamicProductListing from '@/components/DynamicProductListing';
import { searchProducts } from '@/app/actions';
import { cacheLife, cacheTag } from 'next/cache';
import { getServerCountry, getServerUserId } from '@/lib/server-location';

type ShopProps = {
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

// Cached component that fetches products based on sort and country
// Both sort and country become part of the cache key automatically
async function CachedProductList({
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
  cacheTag('shop-products'); // Tag for on-demand revalidation via webhooks

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

  // Fetch all products from Shopify with user's country for pricing
  const products = await searchProducts({
    sortKey,
    reverse,
    first: 50, // Fetch more products for shop page
    countryCode: country,
    userId, // Pass userId for analytics tracking
  });

  return (
    <DynamicProductListing
      initialProducts={products}
      title="Shop All Products"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/shop' },
      ]}
      staticCountry={country}
      sortKey={sortKey}
      reverse={reverse}
    />
  );
}

// Main component that extracts searchParams and gets user country
const Shop = async ({ searchParams }: ShopProps) => {
  // Extract searchParams, country, and userId outside the cached scope
  const params = await searchParams;
  const country = await getServerCountry();
  const userId = await getServerUserId();

  return (
    <div className="bg-white min-h-screen">
      <CachedProductList sort={params.sort} country={country} userId={userId} />
    </div>
  );
};

export default Shop;

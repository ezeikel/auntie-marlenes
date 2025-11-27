import DynamicProductListing from '@/components/DynamicProductListing';
import { searchProducts } from '@/app/actions';
import { cacheLife, cacheTag } from 'next/cache';

type ShopProps = {
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

// Cached component that fetches products based on sort parameters
// The sort parameter becomes part of the cache key automatically
async function CachedProductList({ sort }: { sort?: string }) {
  'use cache';
  cacheLife('days'); // Cache for 1 day - products don't change often
  cacheTag('shop-products'); // Tag for on-demand revalidation via webhooks

  // Use default country for static pre-rendering
  const DEFAULT_COUNTRY = 'GB';

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

  // Fetch all products from Shopify with default country for static rendering
  const products = await searchProducts({
    sortKey,
    reverse,
    first: 50, // Fetch more products for shop page
    countryCode: DEFAULT_COUNTRY,
  });

  return (
    <DynamicProductListing
      initialProducts={products}
      title="Shop All Products"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/shop' },
      ]}
      sortKey={sortKey}
      reverse={reverse}
    />
  );
}

// Main component that extracts searchParams and passes to cached component
const Shop = async ({ searchParams }: ShopProps) => {
  // Extract searchParams outside the cached scope
  const params = await searchParams;

  return (
    <div className="bg-white min-h-screen">
      <CachedProductList sort={params.sort} />
    </div>
  );
};

export default Shop;

import { redirect } from 'next/navigation';
import DynamicProductListing from '@/components/DynamicProductListing';
import { searchProducts } from '@/app/actions';
import { getServerCountry } from '@/lib/server-location';
import { track } from '@/utils/analytics-server';
import { TRACKING_EVENTS } from '@/constants/events';

type SearchProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
};

const Search = async ({ searchParams }: SearchProps) => {
  const params = await searchParams;
  const query = params.q;
  const country = await getServerCountry();

  // Redirect to /shop if no query
  if (!query) {
    redirect('/shop');
  }

  // Map sort parameter to Shopify sortKey
  let sortKey:
    | 'TITLE'
    | 'PRICE'
    | 'CREATED_AT'
    | 'BEST_SELLING'
    | 'RELEVANCE'
    | undefined;
  let reverse = false;

  switch (params.sort) {
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
      sortKey = 'RELEVANCE';
  }

  // Search products from Shopify with user's country for pricing
  const products = await searchProducts({
    query,
    sortKey,
    reverse,
    first: 250,
    countryCode: country,
  });

  // Track search results (server-side)
  await track(TRACKING_EVENTS.SEARCH_RESULTS_LOADED, {
    search_query: query,
    results_count: products.length,
    has_results: products.length > 0,
  });

  return (
    <div className="bg-white min-h-screen">
      <DynamicProductListing
        initialProducts={products}
        title={`Search results for "${query}"`}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: `Search: "${query}"`, href: `/search?q=${query}` },
        ]}
        staticCountry={country}
        query={query}
        sortKey={sortKey}
        reverse={reverse}
      />
    </div>
  );
};

export default Search;

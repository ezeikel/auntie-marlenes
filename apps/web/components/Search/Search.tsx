import { redirect } from 'next/navigation';
import DynamicProductListing from '@/components/DynamicProductListing';
import { searchProducts } from '@/app/actions';

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

  // Use default country for static pre-rendering
  const DEFAULT_COUNTRY = 'GB';

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

  // Search products from Shopify with default country for static rendering
  const products = await searchProducts({
    query,
    sortKey,
    reverse,
    first: 50,
    countryCode: DEFAULT_COUNTRY,
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
        query={query}
        sortKey={sortKey}
        reverse={reverse}
      />
    </div>
  );
};

export default Search;

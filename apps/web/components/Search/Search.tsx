import { redirect } from 'next/navigation';
import ProductListing from '@/components/ProductListing/ProductListing';
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

  // Search products from Shopify
  const products = await searchProducts({
    query,
    sortKey,
    reverse,
    first: 50,
  });

  return (
    <div className="bg-white min-h-screen">
      <ProductListing
        products={products}
        title={`Search results for "${query}"`}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: `Search: "${query}"`, href: `/search?q=${query}` },
        ]}
      />
    </div>
  );
};

export default Search;

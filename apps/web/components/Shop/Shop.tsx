import DynamicProductListing from '@/components/DynamicProductListing';
import { searchProducts } from '@/app/actions';

type ShopProps = {
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

const Shop = async ({ searchParams }: ShopProps) => {
  const params = await searchParams;

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
    <div className="bg-white min-h-screen">
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
    </div>
  );
};

export default Shop;

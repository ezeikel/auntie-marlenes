import DynamicProductListing from '@/components/DynamicProductListing';
import { searchProducts } from '@/app/actions';

type SaleProps = {
  searchParams: Promise<{ sort?: string }>;
};

const Sale = async ({ searchParams }: SaleProps) => {
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

  // Fetch products on sale (compareAtPrice > price) with default country for static rendering
  const products = await searchProducts({
    sortKey,
    reverse,
    first: 50,
    onSale: true, // Filter for products with compareAtPrice
    countryCode: DEFAULT_COUNTRY,
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
        onSale={true}
        sortKey={sortKey}
        reverse={reverse}
      />
    </div>
  );
};

export default Sale;

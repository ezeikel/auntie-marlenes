import ProductListing from '@/components/ProductListing/ProductListing';
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

  // Fetch all products from Shopify
  const products = await searchProducts({
    sortKey,
    reverse,
    first: 50, // Fetch more products for shop page
  });

  return (
    <div className="bg-white min-h-screen">
      <ProductListing
        products={products}
        title="Shop All Products"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/shop' },
        ]}
      />
    </div>
  );
};

export default Shop;

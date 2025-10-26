import AnnouncementBanner from '@/components/AnnouncementBanner';
import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import ProductListing from '@/components/ProductListing/ProductListing';
import { searchProducts } from '@/app/actions';

type SalePageProps = {
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
};

export default async function SalePage({ searchParams }: SalePageProps) {
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

  // Fetch products on sale (compareAtPrice > price)
  const products = await searchProducts({
    sortKey,
    reverse,
    first: 50,
    onSale: true, // Filter for products with compareAtPrice
  });

  return (
    <div className="bg-white min-h-screen">
      <AnnouncementBanner />
      <Header />
      <ProductListing
        products={products}
        title="Sale"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Sale', href: '/sale' },
        ]}
      />
      <Footer />
    </div>
  );
}

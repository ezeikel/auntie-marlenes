import AnnouncementBanner from '@/components/AnnouncementBanner';
import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import ProductListing from '@/components/ProductListing/ProductListing';
import EmptyCategory from '@/components/EmptyCategory';
import { searchProducts } from '@/app/actions';
import { deslugify } from '@/lib/utils/slugify';

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
};

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const searchParamsResolved = await searchParams;

  // Get the category name from slug
  const categoryName = deslugify(categorySlug);

  // Map sort parameter to Shopify sortKey
  let sortKey:
    | 'TITLE'
    | 'PRICE'
    | 'CREATED_AT'
    | 'BEST_SELLING'
    | 'RELEVANCE'
    | undefined;
  let reverse = false;

  switch (searchParamsResolved.sort) {
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

  // Fetch products filtered by category
  const products = await searchProducts({
    productType: categoryName,
    sortKey,
    reverse,
    first: 50,
  });

  return (
    <div className="bg-white min-h-screen">
      <AnnouncementBanner />
      <Header />

      {products.length === 0 ? (
        <EmptyCategory categoryName={categoryName} />
      ) : (
        <ProductListing
          products={products}
          title={categoryName}
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: categoryName, href: `/${categorySlug}` },
          ]}
        />
      )}

      <Footer />
    </div>
  );
}

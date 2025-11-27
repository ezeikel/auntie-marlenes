import DynamicProductListing from '@/components/DynamicProductListing';
import EmptyCategory from '@/components/EmptyCategory';
import { searchProducts } from '@/app/actions';
import { deslugify } from '@/lib/utils/slugify';

type ProductsProps = {
  params: Promise<{ locale?: string; category: string }>;
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
};

const Products = async ({ params, searchParams }: ProductsProps) => {
  const { category: categorySlug } = await params;
  const searchParamsResolved = await searchParams;

  // Use default country for static pre-rendering
  const DEFAULT_COUNTRY = 'GB';

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

  // Fetch products filtered by category with default country for static rendering
  const products = await searchProducts({
    productType: categoryName,
    sortKey,
    reverse,
    first: 50,
    countryCode: DEFAULT_COUNTRY,
  });

  return (
    <div className="bg-white min-h-screen">
      {products.length === 0 ? (
        <EmptyCategory categoryName={categoryName} />
      ) : (
        <DynamicProductListing
          initialProducts={products}
          title={categoryName}
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: categoryName, href: `/${categorySlug}` },
          ]}
          category={categoryName}
          sortKey={sortKey}
          reverse={reverse}
        />
      )}
    </div>
  );
};

export default Products;

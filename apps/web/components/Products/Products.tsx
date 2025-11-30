import DynamicProductListing from '@/components/DynamicProductListing';
import EmptyCategory from '@/components/EmptyCategory';
import { searchProducts } from '@/app/actions';
import { deslugify } from '@/lib/utils/slugify';
import { cacheLife, cacheTag } from 'next/cache';
import { getServerCountry } from '@/lib/server-location';

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

// Cached component that fetches category products based on category, sort, and country
// All three become part of the cache key automatically
async function CachedCategoryProducts({
  categorySlug,
  sort,
  country,
}: {
  categorySlug: string;
  sort?: string;
  country: string;
}) {
  'use cache';
  cacheLife('days'); // Cache for 1 day - products don't change often
  cacheTag('category-products'); // Tag for webhook invalidation

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

  // Fetch products filtered by category with user's country for pricing
  const products = await searchProducts({
    productType: categoryName,
    sortKey,
    reverse,
    first: 50,
    countryCode: country,
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
          staticCountry={country}
          category={categoryName}
          sortKey={sortKey}
          reverse={reverse}
        />
      )}
    </div>
  );
}

// Main component that extracts params and gets user country
const Products = async ({ params, searchParams }: ProductsProps) => {
  const { category: categorySlug } = await params;
  const searchParamsResolved = await searchParams;
  const country = await getServerCountry();

  return (
    <CachedCategoryProducts
      categorySlug={categorySlug}
      sort={searchParamsResolved.sort}
      country={country}
    />
  );
};

export default Products;

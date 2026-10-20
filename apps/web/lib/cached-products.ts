import { unstable_cache } from 'next/cache';
import { getProducts, searchProducts } from '@/app/actions';

// Cache JSON data, not React elements. All query args (including country/user)
// remain part of Next's key, preserving the former component cache boundaries.
const dailySearch = (tag: string) =>
  unstable_cache(searchProducts, [tag], {
    tags: [tag],
    revalidate: 86400,
  });
export const cachedFeaturedProducts = unstable_cache(
  getProducts,
  ['featured-products'],
  {
    tags: ['featured-products'],
    revalidate: 86400,
  },
);
export const cachedBundleProducts = dailySearch('bundle-deals');
export const cachedNewArrivals = dailySearch('new-arrivals');
export const cachedCategoryProducts = dailySearch('category-products');
export const cachedShopProducts = dailySearch('shop-products');
export const cachedSaleProducts = dailySearch('sale-products');

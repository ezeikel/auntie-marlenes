import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductByHandle, searchProducts } from '@/lib/api/shopify';

/**
 * Fetch all products
 */
export const useProducts = (first: number = 50) => {
  return useQuery({
    queryKey: ['products', first],
    queryFn: () => fetchProducts(first),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch product by handle
 */
export const useProduct = (handle: string) => {
  return useQuery({
    queryKey: ['product', handle],
    queryFn: () => fetchProductByHandle(handle),
    enabled: !!handle,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Search products
 */
export const useSearchProducts = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchProducts(query),
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

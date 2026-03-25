'use server';

import { after } from 'next/server';
import { print } from 'graphql';
import {
  GET_PRODUCT_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_PRODUCTS_QUERY,
} from '@/lib/graphql/queries';
import { ProductEdge } from '@/types';
import {
  adaptShopifyProduct,
  adaptShopifyProducts,
} from '@/lib/shopify-adapter';
import type { Product } from '@/lib/constants';
import { track } from '@/utils/analytics-server';
import { TRACKING_EVENTS } from '@/constants/events';

export const getProduct = async ({
  productId,
  countryCode = 'GB',
}: {
  productId: string;
  countryCode?: string;
}): Promise<Product> => {
  const res = await fetch(
    process.env.SHOPIFY_STOREFRONT_API_ENDPOINT as string,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': process.env
          .SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(GET_PRODUCT_QUERY),
        variables: { id: productId, country: countryCode },
      }),
      cache: 'no-store', // Don't cache - countryCode is in POST body
    },
  );

  const {
    data: { product },
  } = await res.json();

  return adaptShopifyProduct(product);
};

export const getProductByHandle = async ({
  handle,
  countryCode = 'GB',
}: {
  handle: string;
  countryCode?: string;
}): Promise<Product> => {
  // Use caching for default country (GB) to enable static generation
  // Use no-store for non-GB countries (dynamic, user-specific)
  const cacheStrategy =
    countryCode === 'GB'
      ? { cache: 'force-cache' as RequestCache, next: { revalidate: 3600 } } // Cache for 1 hour
      : { cache: 'no-store' as RequestCache }; // Dynamic for other countries

  const res = await fetch(
    process.env.SHOPIFY_STOREFRONT_API_ENDPOINT as string,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': process.env
          .SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(GET_PRODUCT_BY_HANDLE_QUERY),
        variables: { handle, country: countryCode },
      }),
      ...cacheStrategy,
    },
  );

  const {
    data: { productByHandle },
  } = await res.json();

  if (!productByHandle) {
    throw new Error(`Product with handle "${handle}" not found`);
  }

  return adaptShopifyProduct(productByHandle);
};

export const getProducts = async (
  countryCode: string = 'GB',
): Promise<Product[]> => {
  // Use caching for default country (GB) to enable static generation
  // Use no-store for non-GB countries (dynamic, user-specific)
  const cacheStrategy =
    countryCode === 'GB'
      ? { cache: 'force-cache' as RequestCache, next: { revalidate: 3600 } } // Cache for 1 hour
      : { cache: 'no-store' as RequestCache }; // Dynamic for other countries

  const res = await fetch(
    process.env.SHOPIFY_STOREFRONT_API_ENDPOINT as string,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': process.env
          .SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(GET_PRODUCTS_QUERY),
        variables: { country: countryCode },
      }),
      ...cacheStrategy,
    },
  );

  const {
    data: { products },
  } = await res.json();

  const shopifyProducts = products.edges.map((edge: ProductEdge) => edge.node);

  return adaptShopifyProducts(shopifyProducts);
};

export const searchProducts = async ({
  query,
  productType,
  vendor,
  sortKey,
  reverse,
  first = 20,
  onSale,
  countryCode = 'GB',
  userId,
}: {
  query?: string;
  productType?: string;
  vendor?: string;
  sortKey?: 'TITLE' | 'PRICE' | 'CREATED_AT' | 'BEST_SELLING' | 'RELEVANCE';
  reverse?: boolean;
  first?: number;
  onSale?: boolean;
  countryCode?: string;
  userId?: string | null;
}): Promise<Product[]> => {
  // Build Shopify search query string
  let searchQuery = '';

  if (query) {
    searchQuery = query;
  }

  if (productType) {
    searchQuery += searchQuery
      ? ` AND product_type:"${productType}"`
      : `product_type:"${productType}"`;
  }

  if (vendor) {
    searchQuery += searchQuery
      ? ` AND vendor:"${vendor}"`
      : `vendor:"${vendor}"`;
  }

  const variables = {
    query: searchQuery || undefined,
    sortKey,
    reverse,
    first,
    country: countryCode,
  };

  console.log(
    '[searchProducts] GraphQL variables:',
    JSON.stringify(variables, null, 2),
  );

  // Use caching for default country (GB) to enable static generation
  // Use no-store for non-GB countries (dynamic, user-specific)
  const cacheStrategy =
    countryCode === 'GB'
      ? { cache: 'force-cache' as RequestCache, next: { revalidate: 3600 } } // Cache for 1 hour
      : { cache: 'no-store' as RequestCache }; // Dynamic for other countries

  const res = await fetch(
    process.env.SHOPIFY_STOREFRONT_API_ENDPOINT as string,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': process.env
          .SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(GET_PRODUCTS_QUERY),
        variables,
      }),
      ...cacheStrategy,
    },
  );

  const {
    data: { products },
  } = await res.json();

  console.log(
    '[searchProducts] Shopify response (first product):',
    JSON.stringify(products.edges[0]?.node, null, 2),
  );

  const shopifyProducts = products.edges.map((edge: ProductEdge) => edge.node);
  let adaptedProducts = adaptShopifyProducts(shopifyProducts);

  console.log(
    '[searchProducts] Adapted product (first):',
    JSON.stringify(adaptedProducts[0], null, 2),
  );

  // Client-side filter for onSale if needed (compareAtPrice > price)
  if (onSale) {
    adaptedProducts = adaptedProducts.filter(
      (product) =>
        product.compareAtPrice && product.compareAtPrice > product.price,
    );
  }

  // Track product search event (non-blocking)
  after(async () => {
    await track(
      TRACKING_EVENTS.PRODUCT_SEARCH,
      {
        query: query || '',
        product_type: productType,
        vendor,
        sort_key: sortKey,
        reverse,
        on_sale: onSale,
        country_code: countryCode,
        results_count: adaptedProducts.length,
        source: 'web',
      },
      userId,
    );
  });

  return adaptedProducts;
};

export const getCategories = async (): Promise<string[]> => {
  const products = await getProducts();
  const categories = new Set(products.map((p) => p.category));
  return Array.from(categories).filter(Boolean);
};

export const getProductVariantId = async ({
  productId,
  selectedOptions,
}: {
  productId: string;
  selectedOptions?: Record<string, string>;
}): Promise<string | null> => {
  const res = await fetch(
    process.env.SHOPIFY_STOREFRONT_API_ENDPOINT as string,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': process.env
          .SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(GET_PRODUCT_QUERY),
        variables: { id: productId },
      }),
    },
  );

  const {
    data: { product },
  } = await res.json();

  if (!product || !product.variants || product.variants.edges.length === 0) {
    return null;
  }

  // If no options provided, return first variant
  if (!selectedOptions) {
    return product.variants.edges[0].node.id;
  }

  // Find variant matching selected options
  const variant = product.variants.edges.find(({ node }: any) => {
    if (!node.selectedOptions) return false;

    return node.selectedOptions.every(
      (option: any) =>
        selectedOptions[option.name.toLowerCase()] ===
        option.value.toLowerCase(),
    );
  });

  return variant?.node.id || product.variants.edges[0].node.id;
};

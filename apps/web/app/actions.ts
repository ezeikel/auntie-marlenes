'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { print } from 'graphql';
import { db } from '@auntie-marlenes/db';
import { cache } from 'react';
import {
  GET_CART_QUERY,
  CREATE_CART_MUTATION,
  GET_PRODUCT_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_PRODUCTS_QUERY,
  ADD_PRODUCTS_TO_CART_MUTATION,
  CART_LINE_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
} from '@/lib/graphql/queries';
import { ProductEdge } from '@/types';
import { auth } from '@/auth';
import {
  adaptShopifyProduct,
  adaptShopifyProducts,
} from '@/lib/shopify-adapter';
import type { Product } from '@/lib/constants';

export const getCartId = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('cartId')?.value;
};

export const getCart = async ({
  cartId: providedCartId,
}: { cartId?: string } = {}) => {
  // Use provided cartId (from API call) or fall back to cookie (web app)
  const cartId = providedCartId || (await getCartId());

  if (!cartId) {
    return null;
  }

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
        query: print(GET_CART_QUERY),
        variables: { id: cartId },
      }),
      next: { tags: ['cart'] },
    },
  );

  const { data: { cart } = { cart: null } } = await res.json();

  return cart;
};

export const createCart = async ({
  productVariantId,
  countryCode = 'GB',
}: {
  productVariantId: string;
  countryCode?: string;
}) => {
  console.log('🛒 [SERVER] createCart called with:', productVariantId);

  // Get user session to pre-fill buyer identity
  const session = await auth();
  console.log('🛒 [SERVER] Session:', session?.user?.email || 'No user');

  // Build cart input with buyer identity if user is logged in
  const cartInput: any = {
    lines: [{ merchandiseId: productVariantId, quantity: 1 }],
  };

  if (session?.user?.email) {
    cartInput.buyerIdentity = {
      email: session.user.email,
      countryCode: countryCode,
    };
  }

  console.log('🛒 [SERVER] Calling Shopify API to create cart...');
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
        query: print(CREATE_CART_MUTATION),
        variables: {
          input: cartInput,
        },
      }),
    },
  );

  const result = await res.json();
  console.log('🛒 [SERVER] Shopify response:', result);

  const {
    data: {
      cartCreate: { cart },
    },
  } = result;

  console.log('🛒 [SERVER] Cart created:', cart.id);

  // TODO: only set for session
  // set cart id in cookie
  const cookieStore = await cookies();
  cookieStore.set('cartId', cart.id, {
    maxAge: 60 * 60 * 24 * 1, // 1 day
    path: '/',
  });

  console.log('🛒 [SERVER] Cookie set, revalidating cache...');
  // update cache - immediate invalidation (no profile for instant expiration)
  revalidateTag('cart', undefined as any);

  console.log('✅ [SERVER] createCart complete!');
  return cart;
};

export const updateCartBuyerIdentity = async ({
  cartId,
  email,
  countryCode = 'GB',
}: {
  cartId: string;
  email: string;
  countryCode?: string;
}) => {
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
        query: print(CART_BUYER_IDENTITY_UPDATE_MUTATION),
        variables: {
          cartId,
          buyerIdentity: {
            email,
            countryCode,
          },
        },
      }),
    },
  );

  const {
    data: {
      cartBuyerIdentityUpdate: { cart, userErrors },
    },
  } = await res.json();

  if (userErrors && userErrors.length > 0) {
    console.error('Failed to update buyer identity:', userErrors);
    throw new Error('Failed to update buyer identity');
  }

  revalidateTag('cart', undefined as any);

  return cart;
};

/**
 * Update cart buyer country code from client-side (used by LocationContext)
 * Automatically uses the current cart from cookies
 */
export const updateCartCountryCode = async (countryCode: string) => {
  const cartId = await getCartId();

  if (!cartId) {
    // No cart exists yet, nothing to update
    return null;
  }

  const session = await auth();
  const email = session?.user?.email;

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
        query: print(CART_BUYER_IDENTITY_UPDATE_MUTATION),
        variables: {
          cartId,
          buyerIdentity: {
            email: email || undefined,
            countryCode,
          },
        },
      }),
    },
  );

  const {
    data: {
      cartBuyerIdentityUpdate: { cart, userErrors },
    },
  } = await res.json();

  if (userErrors && userErrors.length > 0) {
    console.error('Failed to update cart country code:', userErrors);
    throw new Error('Failed to update cart country code');
  }

  revalidateTag('cart', undefined as any);

  return cart;
};

export const addProductsToCart = async ({
  cartId,
  productVariantId,
}: {
  cartId: string;
  productVariantId: string;
}) => {
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
        query: print(ADD_PRODUCTS_TO_CART_MUTATION),
        variables: {
          cartId,
          lines: [{ merchandiseId: productVariantId, quantity: 1 }],
        },
      }),
    },
  );

  const {
    data: {
      cartLinesAdd: { cart: updatedCart, userErrors },
    },
  } = await res.json();

  if (userErrors.length > 0) {
    // Handle any errors
    console.error(userErrors);
    throw new Error('Failed to add product to cart');
  }

  // If user is logged in, ensure buyer identity is set on the cart
  const session = await auth();
  if (session?.user?.email && !updatedCart.buyerIdentity?.email) {
    // Use existing country code from cart if available, otherwise default to GB
    const existingCountry = updatedCart.buyerIdentity?.countryCode || 'GB';
    await updateCartBuyerIdentity({
      cartId,
      email: session.user.email,
      countryCode: existingCountry,
    });
  }

  // update cache - immediate invalidation (no profile for instant expiration)
  revalidateTag('cart', undefined as any);

  return updatedCart;
};

export const removeProductFromCart = async ({
  cartId,
  lineIds,
}: {
  cartId: string;
  lineIds: string[];
}) => {
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
        query: print(CART_LINE_REMOVE_MUTATION),
        variables: { cartId, lineIds },
      }),
    },
  );

  const responseData = await res.json();

  console.log(
    '[removeProductFromCart] Response:',
    JSON.stringify(responseData, null, 2),
  );

  if (!responseData.data?.cartLinesRemove) {
    console.error(
      '[removeProductFromCart] Invalid response structure:',
      responseData,
    );
    throw new Error('Invalid response from Shopify API');
  }

  const {
    data: {
      cartLinesRemove: { cart: updatedCart, userErrors },
    },
  } = responseData;

  if (userErrors && userErrors.length > 0) {
    // handle any errors
    console.error('[removeProductFromCart] User errors:', userErrors);
    throw new Error(
      userErrors[0]?.message || 'Failed to remove product from cart',
    );
  }

  // update cache - immediate invalidation (no profile for instant expiration)
  revalidateTag('cart', undefined as any);

  return updatedCart;
};

export const updateCartLineQuantity = async ({
  cartId,
  lineId,
  quantity,
}: {
  cartId: string;
  lineId: string;
  quantity: number;
}) => {
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
        query: print(CART_LINES_UPDATE_MUTATION),
        variables: {
          cartId,
          lines: [{ id: lineId, quantity }],
        },
      }),
    },
  );

  const {
    data: {
      cartLinesUpdate: { cart: updatedCart, userErrors },
    },
  } = await res.json();

  if (userErrors && userErrors.length > 0) {
    console.error('Failed to update quantity:', userErrors);
    throw new Error('Failed to update cart line quantity');
  }

  // update cache - immediate invalidation (no profile for instant expiration)
  revalidateTag('cart', undefined as any);

  return updatedCart;
};

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

export const getProductByHandle = async ({ handle, countryCode = 'GB' }: { handle: string; countryCode?: string }): Promise<Product> => {
  // Use caching for default country (GB) to enable static generation
  // Use no-store for non-GB countries (dynamic, user-specific)
  const cacheStrategy = countryCode === 'GB'
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

export const getProducts = async (countryCode: string = 'GB'): Promise<Product[]> => {
  // Use caching for default country (GB) to enable static generation
  // Use no-store for non-GB countries (dynamic, user-specific)
  const cacheStrategy = countryCode === 'GB'
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

export const addProductToSaved = async ({
  productId,
}: {
  productId: string;
}) => {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error('You must be logged in to save a product.');
  }

  // Get user by email
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const userId = user.id;

  // Create saved item (upsert to handle duplicates gracefully)
  await db.savedItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {}, // No-op if already exists
    create: {
      userId,
      productId,
    },
  });

  // Revalidate save counts and user's saved items
  revalidateTag('saved-counts', undefined as any);
  revalidateTag(`saved-${userId}`, undefined as any);
};

export const removeProductFromSaved = async ({
  productId,
}: {
  productId: string;
}) => {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error('You must be logged in to remove a product.');
  }

  // Get user by email
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const userId = user.id;

  // Delete saved item
  await db.savedItem.deleteMany({
    where: {
      userId,
      productId,
    },
  });

  // Revalidate save counts and user's saved items
  revalidateTag('saved-counts', undefined as any);
  revalidateTag(`saved-${userId}`, undefined as any);
};

export const getSaved = async (): Promise<string[]> => {
  const session = await auth();

  if (!session?.user?.email) {
    return [];
  }

  // Get user by email
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  const savedItems = await db.savedItem.findMany({
    where: { userId: user.id },
    select: { productId: true },
    orderBy: { createdAt: 'desc' },
  });

  return savedItems.map((item) => item.productId);
};

export const getUser = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
};

export const getUserAccountData = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      savedItems: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    savedItemsCount: user.savedItems.length,
  };
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
}: {
  query?: string;
  productType?: string;
  vendor?: string;
  sortKey?: 'TITLE' | 'PRICE' | 'CREATED_AT' | 'BEST_SELLING' | 'RELEVANCE';
  reverse?: boolean;
  first?: number;
  onSale?: boolean;
  countryCode?: string;
}): Promise<Product[]> => {
  // Build Shopify search query string
  let searchQuery = '';

  if (query) {
    searchQuery = query;
  }

  if (productType) {
    searchQuery += searchQuery
      ? ` AND product_type:${productType}`
      : `product_type:${productType}`;
  }

  if (vendor) {
    searchQuery += searchQuery ? ` AND vendor:${vendor}` : `vendor:${vendor}`;
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
  const cacheStrategy = countryCode === 'GB'
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

  const shopifyProducts = products.edges.map(
    (edge: ProductEdge) => edge.node,
  );
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

/**
 * Get the save count for a single product
 */
export const getProductSaveCount = async ({
  productId,
}: {
  productId: string;
}): Promise<number> => {
  // During build time, return 0 since database isn't available
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return 0;
  }

  try {
    const count = await db.savedItem.count({
      where: { productId },
    });

    return count;
  } catch (error) {
    console.error('Failed to fetch save count:', error);
    return 0;
  }
};

/**
 * Get save counts for multiple products (batch query)
 */
export const getProductsSaveCounts = async ({
  productIds,
}: {
  productIds: string[];
}): Promise<Record<string, number>> => {
  const savedItems = await db.savedItem.groupBy({
    by: ['productId'],
    where: {
      productId: { in: productIds },
    },
    _count: {
      productId: true,
    },
  });

  const counts: Record<string, number> = {};
  savedItems.forEach((item) => {
    counts[item.productId] = item._count.productId;
  });

  return counts;
};

/**
 * Sync localStorage saved items to database
 * Called after sign in/up to migrate guest saves
 */
export const syncLocalSavesToDB = async ({
  productIds,
}: {
  productIds: string[];
}): Promise<{ success: boolean; synced: number }> => {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, synced: 0 };
  }

  // Get user by email
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return { success: false, synced: 0 };
  }

  const userId = user.id;

  if (productIds.length === 0) {
    return { success: true, synced: 0 };
  }

  try {
    // Get existing saved items to avoid duplicates
    const existing = await db.savedItem.findMany({
      where: {
        userId,
        productId: { in: productIds },
      },
      select: { productId: true },
    });

    const existingIds = new Set(existing.map((item) => item.productId));
    const newIds = productIds.filter((id) => !existingIds.has(id));

    // Batch create new saved items
    if (newIds.length > 0) {
      await db.savedItem.createMany({
        data: newIds.map((productId) => ({
          userId,
          productId,
        })),
      });
    }

    // Revalidate caches
    revalidateTag('saved-counts', undefined as any);
    revalidateTag(`saved-${userId}`, undefined as any);

    return { success: true, synced: newIds.length };
  } catch (error) {
    console.error('Failed to sync localStorage saves to DB:', error);
    return { success: false, synced: 0 };
  }
};

/**
 * Set the country cookie for server-side country detection
 * Called by LocationContext when user changes country
 */
export async function setCountryCookie(countryCode: string) {
  const cookieStore = await cookies();
  cookieStore.set('auntie-marlenes-country', countryCode, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  });
}

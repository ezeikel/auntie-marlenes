'use server';

import { print } from 'graphql';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { after } from 'next/server';
import { auth } from '@/auth';
import { TRACKING_EVENTS } from '@/constants/events';
import {
  ADD_PRODUCTS_TO_CART_MUTATION,
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  CART_LINE_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
} from '@/lib/graphql/queries';
import { track } from '@/utils/analytics-server';

export const getCartId = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('cartId')?.value;
};

export const getCart = async ({
  cartId: providedCartId,
}: {
  cartId?: string;
} = {}) => {
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
    maxAge: 60 * 60 * 24 * 14, // 14 days (matches Shopify cart lifetime)
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  console.log('🛒 [SERVER] Cookie set, revalidating cache...');
  // update cache - immediate invalidation (no profile for instant expiration)
  revalidateTag('cart', 'max');

  // Track cart creation event (non-blocking)
  after(async () => {
    await track(TRACKING_EVENTS.CART_CREATED, {
      cart_id: cart.id,
      product_variant_id: productVariantId,
      country_code: countryCode,
      source: 'web',
    });

    // Also track the product add with revenue data
    const firstLine = cart.lines?.edges?.[0]?.node;
    const merchandise = firstLine?.merchandise;
    if (merchandise) {
      await track(TRACKING_EVENTS.PRODUCT_ADDED_TO_CART, {
        cart_id: cart.id,
        product_variant_id: productVariantId,
        source: 'web',
        product_name: merchandise.product?.title,
        product_price: parseFloat(merchandise.price?.amount) || undefined,
        currency: merchandise.price?.currencyCode,
      });
    }
  });

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

  revalidateTag('cart', 'max');

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

  revalidateTag('cart', 'max');

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
  revalidateTag('cart', 'max');

  // Track product added to cart event with revenue data (non-blocking)
  after(async () => {
    // Find the line item that was just added
    const addedLine = updatedCart.lines?.edges?.find(
      (edge: any) => edge.node.merchandise?.id === productVariantId,
    )?.node;
    const merchandise = addedLine?.merchandise;

    await track(TRACKING_EVENTS.PRODUCT_ADDED_TO_CART, {
      cart_id: cartId,
      product_variant_id: productVariantId,
      source: 'web',
      product_name: merchandise?.product?.title,
      product_price: merchandise
        ? parseFloat(merchandise.price?.amount) || undefined
        : undefined,
      currency: merchandise?.price?.currencyCode,
    });
  });

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
  revalidateTag('cart', 'max');

  // Track product removed from cart event (non-blocking)
  after(async () => {
    await track(TRACKING_EVENTS.PRODUCT_REMOVED_FROM_CART, {
      cart_id: cartId,
      line_ids: lineIds,
      source: 'web',
    });
  });

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
  revalidateTag('cart', 'max');

  // Track cart quantity updated event (non-blocking)
  after(async () => {
    await track(TRACKING_EVENTS.CART_QUANTITY_UPDATED, {
      cart_id: cartId,
      line_id: lineId,
      quantity,
      source: 'web',
    });
  });

  return updatedCart;
};

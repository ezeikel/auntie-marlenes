import { SHOPIFY_CONFIG } from '@auntie-marlenes/constants';
import {
  ADD_PRODUCTS_TO_CART_MUTATION,
  adaptShopifyCart,
  adaptShopifyProduct,
  adaptShopifyProducts,
  CART_LINE_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from '@auntie-marlenes/shopify';
import type {
  Cart,
  Product,
  ShopifyCart,
  ShopifyProduct,
} from '@auntie-marlenes/types';
import { GraphQLClient } from 'graphql-request';
import { Platform } from 'react-native';

const client = new GraphQLClient(SHOPIFY_CONFIG.storefrontApiEndpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token':
      process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all products
 */
export const fetchProducts = async (first: number = 50): Promise<Product[]> => {
  try {
    const data = await client.request<{
      products: { edges: Array<{ node: ShopifyProduct }> };
    }>(GET_PRODUCTS_QUERY, { first });

    const shopifyProducts = data.products.edges.map((edge) => edge.node);
    return adaptShopifyProducts(shopifyProducts);
  } catch (error) {
    console.error('[Shopify] Fetch products error:', error);
    throw error;
  }
};

/**
 * Fetch product by handle
 */
export const fetchProductByHandle = async (
  handle: string,
): Promise<Product | null> => {
  try {
    const data = await client.request<{
      productByHandle: ShopifyProduct | null;
    }>(GET_PRODUCT_BY_HANDLE_QUERY, { handle });

    if (!data.productByHandle) {
      return null;
    }

    return adaptShopifyProduct(data.productByHandle);
  } catch (error) {
    console.error('[Shopify] Fetch product by handle error:', error);
    throw error;
  }
};

/**
 * Search products
 */
export const searchProducts = async (
  query: string,
  first: number = 20,
): Promise<Product[]> => {
  try {
    const data = await client.request<{
      products: { edges: Array<{ node: ShopifyProduct }> };
    }>(SEARCH_PRODUCTS_QUERY, { query, first });

    const shopifyProducts = data.products.edges.map((edge) => edge.node);
    return adaptShopifyProducts(shopifyProducts);
  } catch (error) {
    console.error('[Shopify] Search products error:', error);
    throw error;
  }
};

/**
 * Get cart
 */
export const getCart = async (cartId: string): Promise<Cart | null> => {
  try {
    const data = await client.request<{ cart: ShopifyCart | null }>(
      GET_CART_QUERY,
      { id: cartId },
    );

    if (!data.cart) {
      return null;
    }

    return adaptShopifyCart(data.cart);
  } catch (error) {
    console.error('[Shopify] Get cart error:', error);
    throw error;
  }
};

/**
 * Create cart
 */
export const createCart = async (
  variantId: string,
  quantity: number = 1,
): Promise<Cart> => {
  try {
    const data = await client.request<{
      cartCreate: { cart: ShopifyCart };
    }>(CREATE_CART_MUTATION, {
      input: {
        lines: [{ merchandiseId: variantId, quantity }],
      },
    });

    return adaptShopifyCart(data.cartCreate.cart);
  } catch (error) {
    console.error('[Shopify] Create cart error:', error);
    throw error;
  }
};

/**
 * Add to cart
 */
export const addToCart = async (
  cartId: string,
  variantId: string,
  quantity: number = 1,
): Promise<Cart> => {
  try {
    const data = await client.request<{
      cartLinesAdd: { cart: ShopifyCart };
    }>(ADD_PRODUCTS_TO_CART_MUTATION, {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    });

    return adaptShopifyCart(data.cartLinesAdd.cart);
  } catch (error) {
    console.error('[Shopify] Add to cart error:', error);
    throw error;
  }
};

/**
 * Remove from cart
 */
export const removeFromCart = async (
  cartId: string,
  lineId: string,
): Promise<Cart> => {
  try {
    const data = await client.request<{
      cartLinesRemove: { cart: ShopifyCart };
    }>(CART_LINE_REMOVE_MUTATION, {
      cartId,
      lineIds: [lineId],
    });

    return adaptShopifyCart(data.cartLinesRemove.cart);
  } catch (error) {
    console.error('[Shopify] Remove from cart error:', error);
    throw error;
  }
};

/**
 * Update cart line quantity
 */
export const updateCartLineQuantity = async (
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> => {
  try {
    const data = await client.request<{
      cartLinesUpdate: { cart: ShopifyCart };
    }>(CART_LINES_UPDATE_MUTATION, {
      cartId,
      lines: [{ id: lineId, quantity }],
    });

    return adaptShopifyCart(data.cartLinesUpdate.cart);
  } catch (error) {
    console.error('[Shopify] Update cart line error:', error);
    throw error;
  }
};

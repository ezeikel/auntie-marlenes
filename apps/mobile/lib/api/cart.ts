import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getApiUrl } from '@auntie-marlenes/constants';

const apiUrl = getApiUrl(Platform.OS as 'ios' | 'android' | 'web');

/**
 * Get authenticated headers with Bearer token
 */
const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('sessionToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Create a new cart
 */
export const createCart = async (productVariantId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${apiUrl}/cart`,
      { productVariantId },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('[API] Create cart error:', error);
    throw error;
  }
};

/**
 * Get cart by ID
 */
export const getCart = async (cartId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${apiUrl}/cart?cartId=${cartId}`, {
      headers,
    });
    // API returns { cart }, unwrap to get the cart object directly
    return response.data.cart;
  } catch (error) {
    console.error('[API] Get cart error:', error);
    throw error;
  }
};

/**
 * Add product to cart
 */
export const addProductToCart = async (
  cartId: string,
  productVariantId: string
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${apiUrl}/cart/items`,
      { cartId, productVariantId },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('[API] Add product to cart error:', error);
    throw error;
  }
};

/**
 * Remove product from cart
 */
export const removeProductFromCart = async (cartId: string, lineId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${apiUrl}/cart/items`, {
      headers,
      data: { cartId, lineId },
    });
    return response.data;
  } catch (error) {
    console.error('[API] Remove product from cart error:', error);
    throw error;
  }
};

/**
 * Update cart line quantity
 */
export const updateCartLineQuantity = async (
  cartId: string,
  lineId: string,
  quantity: number
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(
      `${apiUrl}/cart/items`,
      { cartId, lineId, quantity },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('[API] Update cart line quantity error:', error);
    throw error;
  }
};

/**
 * Update cart buyer identity (called on login)
 */
export const updateCartBuyerIdentity = async (
  cartId: string,
  email: string,
  countryCode = 'GB'
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(
      `${apiUrl}/cart/buyer-identity`,
      { cartId, email, countryCode },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('[API] Update cart buyer identity error:', error);
    throw error;
  }
};

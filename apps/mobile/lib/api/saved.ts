import { getApiUrl } from '@auntie-marlenes/constants';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const apiUrl = getApiUrl(Platform.OS as 'ios' | 'android' | 'web');

/**
 * Get authenticated headers with Bearer token
 * Saved items API requires authentication
 */
const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('sessionToken');
  if (!token) {
    throw new Error('Authentication required for saved items');
  }
  return { Authorization: `Bearer ${token}` };
};

/**
 * Get user's saved items
 * Returns array of product IDs
 */
export const getSavedItems = async (): Promise<{ productIds: string[] }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${apiUrl}/saved`, { headers });
    return response.data;
  } catch (error) {
    console.error('[API] Get saved items error:', error);
    throw error;
  }
};

/**
 * Add product to saved items
 */
export const addProductToSaved = async (
  productId: string,
): Promise<{ success: boolean }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${apiUrl}/saved`,
      { productId },
      { headers },
    );
    return response.data;
  } catch (error) {
    console.error('[API] Add product to saved error:', error);
    throw error;
  }
};

/**
 * Remove product from saved items
 */
export const removeProductFromSaved = async (
  productId: string,
): Promise<{ success: boolean }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.delete(
      `${apiUrl}/saved?productId=${productId}`,
      { headers },
    );
    return response.data;
  } catch (error) {
    console.error('[API] Remove product from saved error:', error);
    throw error;
  }
};

/**
 * Sync local saved items to backend
 * Called when user logs in to merge AsyncStorage saves with backend
 */
export const syncSavedItems = async (
  productIds: string[],
): Promise<{ success: boolean; synced: number }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${apiUrl}/saved/sync`,
      { productIds },
      { headers },
    );
    return response.data;
  } catch (error) {
    console.error('[API] Sync saved items error:', error);
    throw error;
  }
};

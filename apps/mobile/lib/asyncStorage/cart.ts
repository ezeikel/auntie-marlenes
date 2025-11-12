import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_ID_KEY = "auntie-marlenes-cart-id";

/**
 * Get the stored cart ID from AsyncStorage
 */
export const getCartId = async (): Promise<string | null> => {
  try {
    const cartId = await AsyncStorage.getItem(CART_ID_KEY);
    return cartId;
  } catch (error) {
    console.error("Error getting cart ID from AsyncStorage:", error);
    return null;
  }
};

/**
 * Store the cart ID in AsyncStorage
 */
export const setCartId = async (cartId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CART_ID_KEY, cartId);
  } catch (error) {
    console.error("Error setting cart ID in AsyncStorage:", error);
  }
};

/**
 * Remove the cart ID from AsyncStorage
 */
export const removeCartId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CART_ID_KEY);
  } catch (error) {
    console.error("Error removing cart ID from AsyncStorage:", error);
  }
};

/**
 * Check if a cart ID exists in AsyncStorage
 */
export const hasCartId = async (): Promise<boolean> => {
  try {
    const cartId = await AsyncStorage.getItem(CART_ID_KEY);
    return cartId !== null;
  } catch (error) {
    console.error("Error checking cart ID in AsyncStorage:", error);
    return false;
  }
};

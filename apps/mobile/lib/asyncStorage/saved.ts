import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_ITEMS_KEY = 'auntie-marlenes-saved-items';

/**
 * Get the list of saved product IDs from AsyncStorage
 */
export const getLocalSaves = async (): Promise<string[]> => {
  try {
    const savedItems = await AsyncStorage.getItem(SAVED_ITEMS_KEY);
    return savedItems ? JSON.parse(savedItems) : [];
  } catch (error) {
    console.error('Error getting saved items from AsyncStorage:', error);
    return [];
  }
};

/**
 * Add a product ID to saved items in AsyncStorage
 */
export const addLocalSave = async (productId: string): Promise<void> => {
  try {
    const savedItems = await getLocalSaves();

    // Don't add duplicates
    if (savedItems.includes(productId)) {
      return;
    }

    const updatedSaves = [...savedItems, productId];
    await AsyncStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(updatedSaves));
  } catch (error) {
    console.error('Error adding saved item to AsyncStorage:', error);
  }
};

/**
 * Remove a product ID from saved items in AsyncStorage
 */
export const removeLocalSave = async (productId: string): Promise<void> => {
  try {
    const savedItems = await getLocalSaves();
    const updatedSaves = savedItems.filter((id) => id !== productId);
    await AsyncStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(updatedSaves));
  } catch (error) {
    console.error('Error removing saved item from AsyncStorage:', error);
  }
};

/**
 * Clear all saved items from AsyncStorage
 */
export const clearLocalSaves = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SAVED_ITEMS_KEY);
  } catch (error) {
    console.error('Error clearing saved items from AsyncStorage:', error);
  }
};

/**
 * Check if a product ID is saved in AsyncStorage
 */
export const isLocalSaved = async (productId: string): Promise<boolean> => {
  try {
    const savedItems = await getLocalSaves();
    return savedItems.includes(productId);
  } catch (error) {
    console.error('Error checking if product is saved in AsyncStorage:', error);
    return false;
  }
};

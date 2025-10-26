/**
 * localStorage utility for managing saved/wishlist items for guest users
 * and as a backup for authenticated users
 */

const STORAGE_KEY = 'auntie-marlenes-saved-items';

/**
 * Get saved product IDs from localStorage
 */
export function getLocalSaves(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to read saved items from localStorage:', error);
    return [];
  }
}

/**
 * Add a product ID to localStorage saved items
 */
export function addLocalSave(productId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const saved = getLocalSaves();
    if (!saved.includes(productId)) {
      const updated = [...saved, productId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Failed to add saved item to localStorage:', error);
  }
}

/**
 * Remove a product ID from localStorage saved items
 */
export function removeLocalSave(productId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const saved = getLocalSaves();
    const updated = saved.filter((id) => id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to remove saved item from localStorage:', error);
  }
}

/**
 * Clear all saved items from localStorage
 * Used after syncing to database
 */
export function clearLocalSaves(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear saved items from localStorage:', error);
  }
}

/**
 * Check if a product is saved in localStorage
 */
export function isLocalSaved(productId: string): boolean {
  const saved = getLocalSaves();
  return saved.includes(productId);
}

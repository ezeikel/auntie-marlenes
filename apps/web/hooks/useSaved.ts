'use client';

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from 'react';
import { useSession } from './useSession';
import { addProductToSaved, removeProductFromSaved } from '@/app/actions';
import {
  getLocalSaves,
  addLocalSave,
  removeLocalSave,
} from '@/lib/localStorage-saves';

export function useSaved(initialDbSaves: string[] = []) {
  const { isAuthenticated } = useSession();
  const [isPending, startTransition] = useTransition();
  const [localSaves, setLocalSaves] = useState<string[]>([]);
  const [dbSaves, setDbSaves] = useState<string[]>(initialDbSaves);

  // Load localStorage saves on mount
  useEffect(() => {
    setLocalSaves(getLocalSaves());
  }, []);

  // Merge and deduplicate DB + localStorage saves
  const savedItems = useMemo(
    () => [...new Set([...dbSaves, ...localSaves])],
    [dbSaves, localSaves],
  );

  // Check if a product is saved
  const isSaved = useCallback(
    (productId: string) => {
      return savedItems.includes(productId);
    },
    [savedItems],
  );

  // Toggle save status for a product
  const toggleSave = useCallback(
    async (productId: string) => {
      const currentlySaved = isSaved(productId);
      console.log('🔵 toggleSave called:', {
        productId,
        currentlySaved,
        isAuthenticated,
      });

      startTransition(async () => {
        if (currentlySaved) {
          // Remove from local state immediately (optimistic)
          console.log('🔴 Removing from saves...');
          setLocalSaves((prev) => prev.filter((id) => id !== productId));
          removeLocalSave(productId);

          // Remove from DB if authenticated
          if (isAuthenticated) {
            try {
              console.log('🔴 Calling removeProductFromSaved server action...');
              await removeProductFromSaved({ productId });
              console.log('✅ Successfully removed from DB');
              setDbSaves((prev) => prev.filter((id) => id !== productId));
            } catch (error) {
              console.error('❌ Failed to remove from saved:', error);
              // Revert optimistic update
              setLocalSaves(getLocalSaves());
            }
          } else {
            console.log('👤 Not authenticated, only removed from localStorage');
          }
        } else {
          // Add to local state immediately (optimistic)
          console.log('💚 Adding to saves...');
          setLocalSaves((prev) => [...prev, productId]);
          addLocalSave(productId);

          // Add to DB if authenticated
          if (isAuthenticated) {
            try {
              console.log('💚 Calling addProductToSaved server action...');
              await addProductToSaved({ productId });
              console.log('✅ Successfully added to DB');
              setDbSaves((prev) => [...prev, productId]);
            } catch (error) {
              console.error('❌ Failed to add to saved:', error);
              // Revert optimistic update
              setLocalSaves(getLocalSaves());
            }
          } else {
            console.log('👤 Not authenticated, only saved to localStorage');
          }
        }
      });
    },
    [isSaved, isAuthenticated],
  );

  return {
    savedItems,
    isSaved,
    toggleSave,
    isPending,
  };
}

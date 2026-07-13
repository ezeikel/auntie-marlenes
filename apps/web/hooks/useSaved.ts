'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import {
  addProductToSaved,
  getSaved,
  removeProductFromSaved,
} from '@/app/actions';
import { TRACKING_EVENTS } from '@/constants/events';
import {
  addLocalSave,
  getLocalSaves,
  removeLocalSave,
} from '@/lib/localStorage-saves';
import { logger } from '@/lib/logger';
import { useAnalytics } from '@/utils/analytics-client';
import { useSession } from './useSession';

export function useSaved() {
  const { isAuthenticated } = useSession();
  const [isPending, startTransition] = useTransition();
  const [localSaves, setLocalSaves] = useState<string[]>([]);
  const [dbSaves, setDbSaves] = useState<string[]>([]);
  const [_isMounted, setIsMounted] = useState(false);

  const { track } = useAnalytics();

  // Wait for client-side mount before accessing localStorage
  useEffect(() => {
    setIsMounted(true);
    setLocalSaves(getLocalSaves());
  }, []);

  // // Fetch DB saves when authenticated
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     getSaved().then(setDbSaves);
  //   }
  // }, [isAuthenticated]);

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
      startTransition(async () => {
        if (currentlySaved) {
          // Remove from local state immediately (optimistic)
          setLocalSaves((prev) => prev.filter((id) => id !== productId));
          removeLocalSave(productId);

          // Track unsave
          track(TRACKING_EVENTS.PRODUCT_UNSAVED, {
            product_id: productId,
            is_authenticated: isAuthenticated,
            storage_location: isAuthenticated ? 'database' : 'local_storage',
          });

          // Remove from DB if authenticated
          if (isAuthenticated) {
            try {
              await removeProductFromSaved({ productId });
              setDbSaves((prev) => prev.filter((id) => id !== productId));

              logger.info('Product unsaved from database', {
                productId,
              });
            } catch (error) {
              console.error('❌ Failed to remove from saved:', error);
              // Revert optimistic update
              setLocalSaves(getLocalSaves());

              // Track failure
              track(TRACKING_EVENTS.PRODUCT_UNSAVE_FAILED, {
                product_id: productId,
                error: error instanceof Error ? error.message : 'Unknown error',
              });

              logger.error(
                'Failed to remove product from saved',
                error instanceof Error ? error : new Error('Unknown error'),
                { productId },
              );
            }
          } else {
          }
        } else {
          // Add to local state immediately (optimistic)
          setLocalSaves((prev) => [...prev, productId]);
          addLocalSave(productId);

          // Track save
          track(TRACKING_EVENTS.PRODUCT_SAVED, {
            product_id: productId,
            is_authenticated: isAuthenticated,
            storage_location: isAuthenticated ? 'database' : 'local_storage',
          });

          // Add to DB if authenticated
          if (isAuthenticated) {
            try {
              await addProductToSaved({ productId });
              setDbSaves((prev) => [...prev, productId]);

              logger.info('Product saved to database', {
                productId,
              });
            } catch (error) {
              console.error('❌ Failed to add to saved:', error);
              // Revert optimistic update
              setLocalSaves(getLocalSaves());

              // Track failure
              track(TRACKING_EVENTS.PRODUCT_SAVE_FAILED, {
                product_id: productId,
                error: error instanceof Error ? error.message : 'Unknown error',
              });

              logger.error(
                'Failed to add product to saved',
                error instanceof Error ? error : new Error('Unknown error'),
                { productId },
              );
            }
          } else {
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

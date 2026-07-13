'use client';

import { useEffect, useRef } from 'react';
import { syncLocalSavesToDB } from '@/app/actions';
import { useSession } from '@/hooks/useSession';
import { clearLocalSaves, getLocalSaves } from '@/lib/localStorage-saves';

/**
 * Component that syncs localStorage saved items to database after sign in/up
 * Should be rendered once in the app layout
 */
export default function SavedItemsSync() {
  const { isAuthenticated } = useSession();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    // Only sync once when user becomes authenticated
    if (isAuthenticated && !hasSyncedRef.current) {
      hasSyncedRef.current = true;

      const syncSaves = async () => {
        const localSaves = getLocalSaves();

        if (localSaves.length > 0) {
          try {
            const result = await syncLocalSavesToDB({ productIds: localSaves });

            if (result.success) {
              console.log(`Synced ${result.synced} saved items to database`);
              clearLocalSaves();
            }
          } catch (error) {
            console.error('Failed to sync saved items:', error);
          }
        }
      };

      syncSaves();
    }

    // Reset sync status when user logs out
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated]);

  // This component doesn't render anything
  return null;
}

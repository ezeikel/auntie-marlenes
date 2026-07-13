import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner-native';
import * as savedApi from '../lib/api/saved';
import * as savedStorage from '../lib/asyncStorage/saved';
import { useAuthContext } from './auth';

type SavedContextType = {
  savedItems: string[];
  isLoading: boolean;
  isSaved: (productId: string) => boolean;
  toggleSave: (productId: string) => Promise<void>;
  syncSavedItems: (productIds: string[]) => Promise<void>;
  refetchSaved: () => Promise<void>;
};

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider = ({ children }: { children: ReactNode }) => {
  const [localSaves, setLocalSaves] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthContext();

  // Load local saves from AsyncStorage on mount
  useEffect(() => {
    const loadLocalSaves = async () => {
      const saves = await savedStorage.getLocalSaves();
      setLocalSaves(saves);
    };
    loadLocalSaves();
  }, []);

  // Fetch saved items from API if authenticated
  const { data: apiSaves = [], isLoading: isLoadingApi } = useQuery<string[]>({
    queryKey: ['saved'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      try {
        const response = await savedApi.getSavedItems();
        return response.productIds;
      } catch (error) {
        console.error('Error fetching saved items:', error);
        return [];
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Merge local and API saves (deduplicated)
  const savedItems = [...new Set([...localSaves, ...apiSaves])];

  // Check if product is saved
  const isSaved = useCallback(
    (productId: string) => {
      return savedItems.includes(productId);
    },
    [savedItems],
  );

  // Toggle save mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async (productId: string) => {
      const isCurrentlySaved = isSaved(productId);

      if (isAuthenticated) {
        // Authenticated: Update both API and AsyncStorage
        if (isCurrentlySaved) {
          await savedApi.removeProductFromSaved(productId);
          await savedStorage.removeLocalSave(productId);
        } else {
          await savedApi.addProductToSaved(productId);
          await savedStorage.addLocalSave(productId);
        }
      } else {
        // Guest: Update AsyncStorage only
        if (isCurrentlySaved) {
          await savedStorage.removeLocalSave(productId);
        } else {
          await savedStorage.addLocalSave(productId);
        }
      }

      return { productId, isCurrentlySaved };
    },
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['saved'] });

      // Snapshot previous value
      const previousLocalSaves = localSaves;
      const previousApiSaves = queryClient.getQueryData<string[]>(['saved']);

      // Optimistically update local state
      const isCurrentlySaved = isSaved(productId);
      if (isCurrentlySaved) {
        setLocalSaves((prev) => prev.filter((id) => id !== productId));
        if (isAuthenticated) {
          queryClient.setQueryData<string[]>(['saved'], (old = []) =>
            old.filter((id) => id !== productId),
          );
        }
      } else {
        setLocalSaves((prev) => [...prev, productId]);
        if (isAuthenticated) {
          queryClient.setQueryData<string[]>(['saved'], (old = []) => [
            ...old,
            productId,
          ]);
        }
      }

      return { previousLocalSaves, previousApiSaves };
    },
    onError: (error, productId, context) => {
      // Rollback on error
      if (context?.previousLocalSaves) {
        setLocalSaves(context.previousLocalSaves);
      }
      if (context?.previousApiSaves && isAuthenticated) {
        queryClient.setQueryData(['saved'], context.previousApiSaves);
      }
      toast.error('Failed to update saved items');
      console.error('Toggle save error:', error);
    },
    onSuccess: (data) => {
      if (data.isCurrentlySaved) {
        toast.success('Removed from saved');
      } else {
        toast.success('Added to saved');
      }
    },
  });

  // Sync saved items mutation (called on login)
  const syncSavedItemsMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      if (!isAuthenticated) {
        throw new Error('Must be authenticated to sync saved items');
      }
      return await savedApi.syncSavedItems(productIds);
    },
    onSuccess: async (data) => {
      // TODO: send this to analytics
      console.log(`Synced ${data.synced} saved items to backend`);
      // Refetch saved items from API to get merged list
      await queryClient.invalidateQueries({ queryKey: ['saved'] });
      toast.success('Saved items synced');
    },
    onError: (error) => {
      console.error('Sync saved items error:', error);
      toast.error('Failed to sync saved items');
    },
  });

  // Helper functions
  const toggleSave = useCallback(
    async (productId: string) => {
      await toggleSaveMutation.mutateAsync(productId);
    },
    [toggleSaveMutation],
  );

  const syncSavedItems = useCallback(
    async (productIds: string[]) => {
      await syncSavedItemsMutation.mutateAsync(productIds);
    },
    [syncSavedItemsMutation],
  );

  const refetchSaved = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['saved'] });
  }, [queryClient]);

  return (
    <SavedContext.Provider
      value={{
        savedItems,
        isLoading: isLoadingApi,
        isSaved,
        toggleSave,
        syncSavedItems,
        refetchSaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (context === undefined) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
};

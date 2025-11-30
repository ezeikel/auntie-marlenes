'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSaved as useSavedHook } from '@/hooks/useSaved';

type SavedContextType = {
  savedItems: string[];
  isSaved: (productId: string) => boolean;
  toggleSave: (productId: string) => Promise<void>;
  isPending: boolean;
};

const SavedContext = createContext<SavedContextType | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const savedContext = useSavedHook();

  return (
    <SavedContext.Provider value={savedContext}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved(): SavedContextType {
  const context = useContext(SavedContext);

  // Return safe defaults during SSR or before provider mounts
  if (!context) {
    return {
      savedItems: [],
      isSaved: () => false,
      toggleSave: async () => {},
      isPending: false,
    };
  }

  return context;
}

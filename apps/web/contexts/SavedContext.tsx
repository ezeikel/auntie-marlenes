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

export function SavedProvider({
  children,
  initialDbSaves = [],
}: {
  children: ReactNode;
  initialDbSaves?: string[];
}) {
  const savedContext = useSavedHook(initialDbSaves);

  return (
    <SavedContext.Provider value={savedContext}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within SavedProvider');
  }
  return context;
}

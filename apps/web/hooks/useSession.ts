'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

export function useSession() {
  const { data: session, status } = useNextAuthSession();

  return {
    isAuthenticated: status === 'authenticated',
    user: session?.user
      ? {
          firstName: session.user.name?.split(' ')[0] || 'Guest',
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }
      : null,
    status,
  };
}

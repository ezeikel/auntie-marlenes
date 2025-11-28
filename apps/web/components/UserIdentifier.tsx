'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  identifyUserComplete,
  resetUserComplete,
} from '@/utils/analytics-client';
import { logger } from '@/lib/logger';

/**
 * Component that identifies users in PostHog and Sentry when they log in/out
 * Should be included in the app layout or provider tree
 */
export const UserIdentifier = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const identifyUser = async () => {
      if (status === 'authenticated' && session?.user) {
        const user = session.user;

        // Identify user in PostHog and Sentry
        await identifyUserComplete({
          id: user.id,
          email: user.email,
          name: user.name,
        });

        logger.info('User identified', {
          userId: user.id,
          email: user.email || 'no-email',
        });
      } else if (status === 'unauthenticated') {
        // Reset user identification on logout
        await resetUserComplete();

        logger.info('User logged out, identification reset');
      }
    };

    identifyUser();
  }, [session, status]);

  // This component doesn't render anything
  return null;
};

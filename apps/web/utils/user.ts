import { headers } from 'next/headers';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { CurrentUser } from '@/types';

export const getUserId = async (action?: string) => {
  try {
    const session = await auth();
    const headersList = await headers();

    const userId = session?.user?.id || headersList.get('x-user-id');

    // TODO: create action constants
    if (
      action === 'get the current user' ||
      action === 'track analytics event'
    ) {
      return userId;
    }

    if (!userId) {
      console.error(
        `You need to be logged in to ${action || 'perform this action'}. `,
      );

      return null;
    }

    return userId;
  } catch (error) {
    // During prerendering, headers() will throw an error
    if (
      error instanceof Error &&
      (error.message.includes('prerender') ||
        error.message.includes('headers()') ||
        (error as any).digest === 'HANGING_PROMISE_REJECTION')
    ) {
      // Return null gracefully during prerendering
      return null;
    }
    // Re-throw other unexpected errors
    throw error;
  }
};

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const userId = await getUserId('get the current user');

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return user;
};

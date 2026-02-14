'use server';

import { db } from '@auntie-marlenes/db';
import { auth } from '@/auth';

export const getUser = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
};

export const getUserAccountData = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      savedItems: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    savedItemsCount: user.savedItems.length,
  };
};

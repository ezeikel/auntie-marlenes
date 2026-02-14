'use server';

import { revalidateTag } from 'next/cache';
import { after } from 'next/server';
import { db } from '@auntie-marlenes/db';
import { auth } from '@/auth';
import { track } from '@/utils/analytics-server';
import { TRACKING_EVENTS } from '@/constants/events';

export const addProductToSaved = async ({
  productId,
}: {
  productId: string;
}) => {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error('You must be logged in to save a product.');
  }

  // Get user by email
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const userId = user.id;

  // Create saved item (upsert to handle duplicates gracefully)
  await db.savedItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {}, // No-op if already exists
    create: {
      userId,
      productId,
    },
  });

  // Revalidate save counts and user's saved items
  revalidateTag('saved-counts', 'max');
  revalidateTag(`saved-${userId}`, 'max');

  // Track product saved event (non-blocking)
  after(async () => {
    await track(TRACKING_EVENTS.PRODUCT_SAVED, {
      product_id: productId,
      user_id: userId,
      source: 'web',
    });
  });
};

export const removeProductFromSaved = async ({
  productId,
}: {
  productId: string;
}) => {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error('You must be logged in to remove a product.');
  }

  // Get user by email
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const userId = user.id;

  // Delete saved item
  await db.savedItem.deleteMany({
    where: {
      userId,
      productId,
    },
  });

  // Revalidate save counts and user's saved items
  revalidateTag('saved-counts', 'max');
  revalidateTag(`saved-${userId}`, 'max');

  // Track product unsaved event (non-blocking)
  after(async () => {
    await track(TRACKING_EVENTS.PRODUCT_UNSAVED, {
      product_id: productId,
      user_id: userId,
      source: 'web',
    });
  });
};

export const getSaved = async (): Promise<string[]> => {
  const session = await auth();

  if (!session?.user?.email) {
    return [];
  }

  // Get user by email
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  const savedItems = await db.savedItem.findMany({
    where: { userId: user.id },
    select: { productId: true },
    orderBy: { createdAt: 'desc' },
  });

  return savedItems.map((item) => item.productId);
};

/**
 * Get the save count for a single product
 */
export const getProductSaveCount = async ({
  productId,
}: {
  productId: string;
}): Promise<number> => {
  // During build time, return 0 since database isn't available
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return 0;
  }

  try {
    const count = await db.savedItem.count({
      where: { productId },
    });

    return count;
  } catch (error) {
    console.error('Failed to fetch save count:', error);
    return 0;
  }
};

/**
 * Get save counts for multiple products (batch query)
 */
export const getProductsSaveCounts = async ({
  productIds,
}: {
  productIds: string[];
}): Promise<Record<string, number>> => {
  const savedItems = await db.savedItem.groupBy({
    by: ['productId'],
    where: {
      productId: { in: productIds },
    },
    _count: {
      productId: true,
    },
  });

  const counts: Record<string, number> = {};
  savedItems.forEach((item) => {
    counts[item.productId] = item._count.productId;
  });

  return counts;
};

/**
 * Sync localStorage saved items to database
 * Called after sign in/up to migrate guest saves
 */
export const syncLocalSavesToDB = async ({
  productIds,
}: {
  productIds: string[];
}): Promise<{ success: boolean; synced: number }> => {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, synced: 0 };
  }

  // Get user by email
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return { success: false, synced: 0 };
  }

  const userId = user.id;

  if (productIds.length === 0) {
    return { success: true, synced: 0 };
  }

  try {
    // Get existing saved items to avoid duplicates
    const existing = await db.savedItem.findMany({
      where: {
        userId,
        productId: { in: productIds },
      },
      select: { productId: true },
    });

    const existingIds = new Set(existing.map((item) => item.productId));
    const newIds = productIds.filter((id) => !existingIds.has(id));

    // Batch create new saved items
    if (newIds.length > 0) {
      await db.savedItem.createMany({
        data: newIds.map((productId) => ({
          userId,
          productId,
        })),
      });
    }

    // Revalidate caches
    revalidateTag('saved-counts', 'max');
    revalidateTag(`saved-${userId}`, 'max');

    // Track saved items synced event (non-blocking)
    if (newIds.length > 0) {
      after(async () => {
        await track(TRACKING_EVENTS.SAVED_ITEMS_SYNCED, {
          user_id: userId,
          product_ids: newIds,
          synced_count: newIds.length,
          source: 'web',
        });
      });
    }

    return { success: true, synced: newIds.length };
  } catch (error) {
    console.error('Failed to sync localStorage saves to DB:', error);
    return { success: false, synced: 0 };
  }
};

import { NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth-mobile';
import { db } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

/**
 * POST /api/saved/sync - Sync local saved items to database
 * Body: { productIds: string[] }
 * Requires authentication
 *
 * Used when user logs in to merge their local saved items with backend
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productIds } = await request.json();

    if (!Array.isArray(productIds)) {
      return Response.json(
        { error: 'productIds must be an array' },
        { status: 400 },
      );
    }

    if (productIds.length === 0) {
      return Response.json(
        { success: true, synced: 0 },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json',
          },
          status: 200,
        },
      );
    }

    // Get existing saved items to avoid duplicates
    const existing = await db.savedItem.findMany({
      where: {
        userId,
        productId: { in: productIds },
      },
      select: { productId: true },
    });

    const existingIds = new Set(
      existing.map((item: { productId: string }) => item.productId),
    );
    const newIds = productIds.filter((id: string) => !existingIds.has(id));

    // Batch create new saved items
    let synced = 0;
    if (newIds.length > 0) {
      await db.savedItem.createMany({
        data: newIds.map((productId: string) => ({
          userId,
          productId,
        })),
      });
      synced = newIds.length;
    }

    // Revalidate cache
    revalidateTag('saved-counts', undefined as any);
    revalidateTag(`saved-${userId}`, undefined as any);

    return Response.json(
      { success: true, synced },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('[API] Error syncing saved items:', error);
    return Response.json(
      { error: 'Failed to sync saved items' },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

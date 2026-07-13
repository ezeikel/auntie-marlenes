import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';
import { getUserIdFromToken } from '@/lib/auth-mobile';
import { corsHeaders, corsOptionsResponse } from '@/lib/cors';
import { db } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

const syncSavedSchema = z.object({
  productIds: z.array(z.string().min(1)).max(100),
});

/**
 * POST /api/saved/sync - Sync local saved items to database
 * Body: { productIds: string[] }
 * Requires authentication
 *
 * Used when user logs in to merge their local saved items with backend
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const userId = await getUserIdFromToken();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productIds } = syncSavedSchema.parse(body);

    if (productIds.length === 0) {
      return Response.json(
        { success: true, synced: 0 },
        {
          headers: corsHeaders(request, 'POST, OPTIONS'),
          status: 200,
        },
      );
    }

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

    revalidateTag('saved-counts', 'max');
    revalidateTag(`saved-${userId}`, 'max');

    return Response.json(
      { success: true, synced },
      {
        headers: corsHeaders(request, 'POST, OPTIONS'),
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: 'Invalid request', details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error('[API] Error syncing saved items:', error);
    return Response.json(
      { error: 'Failed to sync saved items' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request, 'POST, OPTIONS');
}

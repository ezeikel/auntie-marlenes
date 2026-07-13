import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';
import { getUserIdFromToken } from '@/lib/auth-mobile';
import { corsHeaders, corsOptionsResponse } from '@/lib/cors';
import { db } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

const saveProductSchema = z.object({
  productId: z.string().min(1),
});

/**
 * GET /api/saved - Get user's saved items
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const userId = await getUserIdFromToken();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedItems = await db.savedItem.findMany({
      where: { userId },
      select: { productId: true },
      orderBy: { createdAt: 'desc' },
    });

    const productIds = savedItems.map(
      (item: { productId: string }) => item.productId,
    );

    return Response.json(
      { productIds },
      {
        headers: corsHeaders(request, 'GET, POST, DELETE, OPTIONS'),
        status: 200,
      },
    );
  } catch (error) {
    console.error('[API] Error fetching saved items:', error);
    return Response.json(
      { error: 'Failed to fetch saved items' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/saved - Add product to saved items
 * Body: { productId: string }
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const userId = await getUserIdFromToken();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = saveProductSchema.parse(body);

    await db.savedItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
    });

    revalidateTag('saved-counts', 'max');
    revalidateTag(`saved-${userId}`, 'max');

    return Response.json(
      { success: true },
      {
        headers: corsHeaders(request, 'GET, POST, DELETE, OPTIONS'),
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
    console.error('[API] Error adding product to saved:', error);
    return Response.json(
      { error: 'Failed to add product to saved' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/saved?productId=xxx - Remove product from saved items
 * Query param: productId
 * Requires authentication
 */
export async function DELETE(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const userId = await getUserIdFromToken();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return Response.json(
        { error: 'productId query parameter is required' },
        { status: 400 },
      );
    }

    await db.savedItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    revalidateTag('saved-counts', 'max');
    revalidateTag(`saved-${userId}`, 'max');

    return Response.json(
      { success: true },
      {
        headers: corsHeaders(request, 'GET, POST, DELETE, OPTIONS'),
        status: 200,
      },
    );
  } catch (error) {
    console.error('[API] Error removing product from saved:', error);
    return Response.json(
      { error: 'Failed to remove product from saved' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request, 'GET, POST, DELETE, OPTIONS');
}

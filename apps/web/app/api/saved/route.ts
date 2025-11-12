import { NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth-mobile';
import { db } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

/**
 * GET /api/saved - Get user's saved items
 * Requires authentication
 */
export async function GET() {
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
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
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
  try {
    const userId = await getUserIdFromToken();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 });
    }

    // Upsert to handle duplicates gracefully
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

    // Revalidate cache
    revalidateTag('saved-counts', undefined as any);
    revalidateTag(`saved-${userId}`, undefined as any);

    return Response.json(
      { success: true },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
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

    // Revalidate cache
    revalidateTag('saved-counts', undefined as any);
    revalidateTag(`saved-${userId}`, undefined as any);

    return Response.json(
      { success: true },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
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

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

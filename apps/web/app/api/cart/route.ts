import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { createCart, getCart as getCartAction } from '@/app/actions';
import { rateLimit } from '@/lib/rate-limit';

/**
 * POST /api/cart - Create a new cart
 * Body: { productVariantId: string }
 * Optional auth via Bearer token (pre-fills buyer identity)
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { productVariantId } = await request.json();

    if (!productVariantId) {
      return Response.json(
        { error: 'productVariantId is required' },
        { status: 400 },
      );
    }

    const cart = await createCart({ productVariantId });

    return Response.json(
      { cart },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
        status: 201,
      },
    );
  } catch (error) {
    console.error('[API] Error creating cart:', error);
    return Response.json({ error: 'Failed to create cart' }, { status: 500 });
  }
}

/**
 * GET /api/cart?cartId=xxx - Get cart by ID
 * Query param: cartId
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return Response.json(
        { error: 'cartId query parameter is required' },
        { status: 400 },
      );
    }

    const cart = await getCartAction({ cartId });

    return Response.json(
      { cart },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('[API] Error fetching cart:', error);
    return Response.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

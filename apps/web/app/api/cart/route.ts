import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';
import { createCart, getCart as getCartAction } from '@/app/actions';
import { corsHeaders, corsOptionsResponse } from '@/lib/cors';
import { rateLimit } from '@/lib/rate-limit';

const createCartSchema = z.object({
  productVariantId: z.string().min(1),
});

/**
 * POST /api/cart - Create a new cart
 * Body: { productVariantId: string }
 * Optional auth via Bearer token (pre-fills buyer identity)
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { productVariantId } = createCartSchema.parse(body);

    const cart = await createCart({ productVariantId });

    return Response.json(
      { cart },
      {
        headers: corsHeaders(request, 'POST, OPTIONS'),
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: 'Invalid request', details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
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
        headers: corsHeaders(request, 'GET, OPTIONS'),
        status: 200,
      },
    );
  } catch (error) {
    console.error('[API] Error fetching cart:', error);
    return Response.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request, 'GET, POST, OPTIONS');
}

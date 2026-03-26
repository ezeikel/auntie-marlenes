import { NextRequest } from 'next/server';
import { updateCartBuyerIdentity } from '@/app/actions';
import { rateLimit } from '@/lib/rate-limit';

/**
 * PATCH /api/cart/buyer-identity - Update cart buyer identity
 * Body: { cartId: string, email: string, countryCode?: string }
 * Called when user logs in to associate cart with their email
 */
export async function PATCH(request: NextRequest) {
  const limited = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { cartId, email, countryCode } = await request.json();

    if (!cartId || !email) {
      return Response.json(
        { error: 'cartId and email are required' },
        { status: 400 },
      );
    }

    const cart = await updateCartBuyerIdentity({
      cartId,
      email,
      countryCode: countryCode || 'GB',
    });

    return Response.json(
      { cart },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('[API] Error updating cart buyer identity:', error);
    return Response.json(
      { error: 'Failed to update cart buyer identity' },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

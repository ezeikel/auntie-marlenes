import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';
import { updateCartBuyerIdentity } from '@/app/actions';
import { corsHeaders, corsOptionsResponse } from '@/lib/cors';
import { rateLimit } from '@/lib/rate-limit';

const buyerIdentitySchema = z.object({
  cartId: z.string().min(1),
  email: z.string().email(),
  countryCode: z.string().length(2).optional(),
});

/**
 * PATCH /api/cart/buyer-identity - Update cart buyer identity
 * Body: { cartId: string, email: string, countryCode?: string }
 * Called when user logs in to associate cart with their email
 */
export async function PATCH(request: NextRequest) {
  const limited = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { cartId, email, countryCode } = buyerIdentitySchema.parse(body);

    const cart = await updateCartBuyerIdentity({
      cartId,
      email,
      countryCode: countryCode || 'GB',
    });

    return Response.json(
      { cart },
      {
        headers: corsHeaders(request, 'PATCH, OPTIONS'),
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
    console.error('[API] Error updating cart buyer identity:', error);
    return Response.json(
      { error: 'Failed to update cart buyer identity' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request, 'PATCH, OPTIONS');
}

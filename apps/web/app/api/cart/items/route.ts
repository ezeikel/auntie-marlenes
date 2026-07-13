import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';
import {
  addProductsToCart,
  removeProductFromCart,
  updateCartLineQuantity,
} from '@/app/actions';
import { corsHeaders, corsOptionsResponse } from '@/lib/cors';
import { rateLimit } from '@/lib/rate-limit';

const addToCartSchema = z.object({
  cartId: z.string().min(1),
  productVariantId: z.string().min(1),
});

const removeFromCartSchema = z.object({
  cartId: z.string().min(1),
  lineId: z.string().min(1),
});

const updateQuantitySchema = z.object({
  cartId: z.string().min(1),
  lineId: z.string().min(1),
  quantity: z.number().int().min(0),
});

/**
 * POST /api/cart/items - Add product to cart
 * Body: { cartId: string, productVariantId: string }
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { cartId, productVariantId } = addToCartSchema.parse(body);

    const cart = await addProductsToCart({ cartId, productVariantId });

    return Response.json(
      { cart },
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
    console.error('[API] Error adding product to cart:', error);
    return Response.json(
      { error: 'Failed to add product to cart' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/cart/items - Remove product from cart
 * Body: { cartId: string, lineId: string }
 */
export async function DELETE(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { cartId, lineId } = removeFromCartSchema.parse(body);

    const cart = await removeProductFromCart({ cartId, lineIds: [lineId] });

    return Response.json(
      { cart },
      {
        headers: corsHeaders(request, 'DELETE, OPTIONS'),
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
    console.error('[API] Error removing product from cart:', error);
    return Response.json(
      { error: 'Failed to remove product from cart' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/cart/items - Update cart line quantity
 * Body: { cartId: string, lineId: string, quantity: number }
 */
export async function PATCH(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { cartId, lineId, quantity } = updateQuantitySchema.parse(body);

    const cart = await updateCartLineQuantity({ cartId, lineId, quantity });

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
    console.error('[API] Error updating cart line quantity:', error);
    return Response.json(
      { error: 'Failed to update cart line quantity' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request, 'POST, DELETE, PATCH, OPTIONS');
}

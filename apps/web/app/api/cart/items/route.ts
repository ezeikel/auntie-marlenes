import { NextRequest } from 'next/server';
import {
  addProductsToCart,
  removeProductFromCart,
  updateCartLineQuantity,
} from '@/app/actions';

/**
 * POST /api/cart/items - Add product to cart
 * Body: { cartId: string, productVariantId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { cartId, productVariantId } = await request.json();

    if (!cartId || !productVariantId) {
      return Response.json(
        { error: 'cartId and productVariantId are required' },
        { status: 400 },
      );
    }

    const cart = await addProductsToCart({ cartId, productVariantId });

    return Response.json(
      { cart },
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
  try {
    const { cartId, lineId } = await request.json();

    if (!cartId || !lineId) {
      return Response.json(
        { error: 'cartId and lineId are required' },
        { status: 400 },
      );
    }

    const cart = await removeProductFromCart({ cartId, lineIds: [lineId] });

    return Response.json(
      { cart },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
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
  try {
    const { cartId, lineId, quantity } = await request.json();

    if (!cartId || !lineId || typeof quantity !== 'number') {
      return Response.json(
        { error: 'cartId, lineId, and quantity are required' },
        { status: 400 },
      );
    }

    const cart = await updateCartLineQuantity({ cartId, lineId, quantity });

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
    console.error('[API] Error updating cart line quantity:', error);
    return Response.json(
      { error: 'Failed to update cart line quantity' },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

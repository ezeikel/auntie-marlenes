import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import crypto from 'crypto';
import { track } from '@/utils/analytics-server';
import { TRACKING_EVENTS } from '@/constants/events';
import { db } from '@/lib/prisma';
import {
  sendOrderConfirmationEmail,
  sendShippingUpdateEmail,
} from '@/lib/email';

/**
 * Verify that the webhook request is from Shopify
 */
async function verifyShopifyWebhook(
  body: string,
  hmacHeader: string,
): Promise<boolean> {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('SHOPIFY_WEBHOOK_SECRET is not set');
    return false;
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmacHeader;
}

/**
 * Extract line items from Shopify order payload for analytics
 */
function extractLineItems(lineItems: any[]): Array<{
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  price: number;
}> {
  return (lineItems || []).map((item: any) => ({
    product_id: String(item.product_id || ''),
    variant_id: String(item.variant_id || ''),
    title: item.title || '',
    quantity: item.quantity || 0,
    price: parseFloat(item.price) || 0,
  }));
}

/**
 * Handle Shopify webhooks
 * Supported events:
 * - orders/create: Order created
 * - orders/updated: Order updated
 * - orders/cancelled: Order cancelled
 * - orders/paid: Order paid
 * - products/create: Product created
 * - products/update: Product updated
 * - products/delete: Product deleted
 */
export async function POST(request: Request) {
  try {
    // Get the raw body as text for HMAC verification
    const body = await request.text();
    const headersList = await headers();
    const hmacHeader = headersList.get('x-shopify-hmac-sha256');
    const topic = headersList.get('x-shopify-topic');
    const shopDomain = headersList.get('x-shopify-shop-domain');

    console.log('[Shopify Webhook] Received:', { topic, shopDomain });

    // Verify the webhook is from Shopify
    if (!hmacHeader || !(await verifyShopifyWebhook(body, hmacHeader))) {
      console.error('[Shopify Webhook] Invalid HMAC signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the JSON body
    const data = JSON.parse(body);

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
        await handleOrderCreate(data);
        break;

      case 'orders/updated':
        await handleOrderUpdate(data);
        break;

      case 'orders/cancelled':
        await handleOrderCancelled(data);
        break;

      case 'orders/paid':
        await handleOrderPaid(data);
        break;

      case 'products/create':
        await handleProductCreate(data);
        break;

      case 'products/update':
        await handleProductUpdate(data);
        break;

      case 'products/delete':
        await handleProductDelete(data);
        break;

      case 'checkouts/create':
      case 'checkouts/update':
        await handleCheckout(data);
        break;

      default:
        console.log(`[Shopify Webhook] Unhandled topic: ${topic}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Shopify Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * Handle order creation — tracks all orders including unpaid ones
 */
async function handleOrderCreate(order: any) {
  const lineItems = extractLineItems(order.line_items);
  const itemCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  console.log('[Shopify Webhook] Order created:', {
    id: order.id,
    orderNumber: order.order_number,
    email: order.email,
    total: order.total_price,
    currency: order.currency,
  });

  await track(
    TRACKING_EVENTS.ORDER_CREATED,
    {
      order_id: String(order.id),
      order_number: String(order.order_number),
      order_name: order.name || `#${order.order_number}`,
      total_amount: parseFloat(order.total_price) || 0,
      subtotal_amount: parseFloat(order.subtotal_price) || 0,
      currency: order.currency || 'GBP',
      customer_email: order.email || '',
      item_count: itemCount,
      financial_status: order.financial_status || 'pending',
      line_items: lineItems,
      source: 'webhook',
      $insert_id: `order-created-${order.id}`,
    },
    { distinctId: order.email || `shopify-order-${order.id}` },
  );
}

/**
 * Handle order updates
 */
async function handleOrderUpdate(order: any) {
  console.log('[Shopify Webhook] Order updated:', {
    id: order.id,
    orderNumber: order.order_number,
    status: order.financial_status,
    fulfillmentStatus: order.fulfillment_status,
  });

  // Send shipping update when order is fulfilled
  if (
    order.fulfillment_status === 'fulfilled' &&
    order.fulfillments?.length > 0
  ) {
    try {
      await sendShippingUpdateEmail(order);
    } catch (err) {
      console.error(
        '[Shopify Webhook] Failed to send shipping update email:',
        err,
      );
    }

    // Record delivery for restock reminder (30 days later)
    try {
      await db.deliveredOrder.upsert({
        where: { shopifyOrderId: String(order.id) },
        update: { deliveredAt: new Date() },
        create: {
          shopifyOrderId: String(order.id),
          email: order.email,
          lineItems: (order.line_items || []).map((item: any) => ({
            title: item.title || '',
            handle: item.handle || '',
            image: item.image?.src || '',
          })),
          deliveredAt: new Date(),
        },
      });
    } catch (err) {
      console.error('[Shopify Webhook] Failed to record delivered order:', err);
    }
  }
}

/**
 * Handle order cancellation
 */
async function handleOrderCancelled(order: any) {
  console.log('[Shopify Webhook] Order cancelled:', {
    id: order.id,
    orderNumber: order.order_number,
    cancelReason: order.cancel_reason,
  });
}

/**
 * Handle order paid — primary server-side purchase tracking
 */
async function handleOrderPaid(order: any) {
  const lineItems = extractLineItems(order.line_items);
  const itemCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  console.log('[Shopify Webhook] Order paid:', {
    id: order.id,
    orderNumber: order.order_number,
    total: order.total_price,
    currency: order.currency,
    email: order.email,
  });

  await track(
    TRACKING_EVENTS.ORDER_PAID,
    {
      order_id: String(order.id),
      order_number: String(order.order_number),
      order_name: order.name || `#${order.order_number}`,
      total_amount: parseFloat(order.total_price) || 0,
      subtotal_amount: parseFloat(order.subtotal_price) || 0,
      currency: order.currency || 'GBP',
      customer_email: order.email || '',
      item_count: itemCount,
      line_items: lineItems,
      source: 'webhook',
      $insert_id: `order-paid-${order.id}`,
    },
    { distinctId: order.email || `shopify-order-${order.id}` },
  );

  // Send order confirmation email
  try {
    await sendOrderConfirmationEmail(order);
  } catch (err) {
    console.error(
      '[Shopify Webhook] Failed to send order confirmation email:',
      err,
    );
  }

  // Mark any abandoned checkout as completed so we don't send a recovery email
  if (order.checkout_token) {
    try {
      await db.abandonedCheckout.updateMany({
        where: { checkoutToken: order.checkout_token },
        data: { completedAt: new Date() },
      });
    } catch {
      // Checkout may not exist in our DB — that's fine
    }
  }
}

/**
 * Handle product creation
 * Revalidates all product-related cache tags
 */
async function handleProductCreate(product: any) {
  console.log('[Shopify Webhook] Product created:', {
    id: product.id,
    title: product.title,
    handle: product.handle,
  });

  // Revalidate all product-related caches with stale-while-revalidate
  revalidateTag('shop-products', 'max');
  revalidateTag('featured-products', 'max');
  revalidateTag('bundle-deals', 'max');
  revalidateTag('category-products', 'max');
  revalidateTag('sale-products', 'max');
  console.log('[Shopify Webhook] Revalidated all product caches');
}

/**
 * Handle product updates
 * Revalidates all product-related cache tags
 */
async function handleProductUpdate(product: any) {
  console.log('[Shopify Webhook] Product updated:', {
    id: product.id,
    title: product.title,
    handle: product.handle,
  });

  revalidateTag('shop-products', 'max');
  revalidateTag('featured-products', 'max');
  revalidateTag('bundle-deals', 'max');
  revalidateTag('category-products', 'max');
  revalidateTag('sale-products', 'max');
  console.log('[Shopify Webhook] Revalidated all product caches');
}

/**
 * Handle product deletion
 * Revalidates all product-related cache tags
 */
async function handleProductDelete(product: any) {
  console.log('[Shopify Webhook] Product deleted:', {
    id: product.id,
  });

  revalidateTag('shop-products', 'max');
  revalidateTag('featured-products', 'max');
  revalidateTag('bundle-deals', 'max');
  revalidateTag('category-products', 'max');
  revalidateTag('sale-products', 'max');
  console.log('[Shopify Webhook] Revalidated all product caches');
}

/**
 * Handle checkout create/update — store for abandoned cart recovery
 */
async function handleCheckout(checkout: any) {
  const email = checkout.email;
  const token = checkout.token || checkout.cart_token;

  if (!email || !token) {
    console.log('[Shopify Webhook] Checkout missing email or token, skipping');
    return;
  }

  console.log('[Shopify Webhook] Checkout tracked:', {
    token,
    email,
    totalPrice: checkout.total_price,
  });

  try {
    await db.abandonedCheckout.upsert({
      where: { checkoutToken: token },
      update: {
        email,
        checkoutUrl: checkout.abandoned_checkout_url || '',
        lineItems: (checkout.line_items || []).map((item: any) => ({
          title: item.title || '',
          price: item.price || '0',
          quantity: item.quantity || 1,
          image: item.image_url || item.image || '',
        })),
        totalPrice: checkout.total_price || '0.00',
        currency: checkout.currency || 'GBP',
      },
      create: {
        checkoutToken: token,
        email,
        checkoutUrl: checkout.abandoned_checkout_url || '',
        lineItems: (checkout.line_items || []).map((item: any) => ({
          title: item.title || '',
          price: item.price || '0',
          quantity: item.quantity || 1,
          image: item.image_url || item.image || '',
        })),
        totalPrice: checkout.total_price || '0.00',
        currency: checkout.currency || 'GBP',
      },
    });
  } catch (err) {
    console.error('[Shopify Webhook] Failed to store checkout:', err);
  }
}

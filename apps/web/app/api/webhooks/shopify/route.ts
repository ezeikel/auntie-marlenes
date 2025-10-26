import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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
 * Handle Shopify webhooks
 * Supported events:
 * - orders/create: Order created
 * - orders/updated: Order updated
 * - orders/cancelled: Order cancelled
 */
export async function POST(request: Request) {
  try {
    // Get the raw body as text for HMAC verification
    const body = await request.text();
    const headersList = await headers();
    const hmacHeader = headersList.get('x-shopify-hmac-sha256');
    const topic = headersList.get('x-shopify-topic');
    const shopDomain = headersList.get('x-shopify-shop-domain');

    console.log('📦 [Shopify Webhook] Received:', { topic, shopDomain });

    // Verify the webhook is from Shopify
    if (!hmacHeader || !(await verifyShopifyWebhook(body, hmacHeader))) {
      console.error('❌ [Shopify Webhook] Invalid HMAC signature');
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

      default:
        console.log(`⚠️  [Shopify Webhook] Unhandled topic: ${topic}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('❌ [Shopify Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * Handle order creation
 */
async function handleOrderCreate(order: any) {
  console.log('✅ [Shopify Webhook] Order created:', {
    id: order.id,
    orderNumber: order.order_number,
    email: order.email,
    total: order.total_price,
    currency: order.currency,
  });

  // TODO: Save order to your database
  // Example:
  // await db.order.create({
  //   data: {
  //     shopifyOrderId: order.id.toString(),
  //     orderNumber: order.order_number.toString(),
  //     email: order.email,
  //     total: parseFloat(order.total_price),
  //     currency: order.currency,
  //     status: order.financial_status,
  //     lineItems: order.line_items,
  //     shippingAddress: order.shipping_address,
  //     createdAt: new Date(order.created_at),
  //   },
  // })

  // TODO: Send confirmation email (if not already sent by Shopify)

  // TODO: Trigger any post-purchase flows (analytics, CRM, etc.)
}

/**
 * Handle order updates
 */
async function handleOrderUpdate(order: any) {
  console.log('📝 [Shopify Webhook] Order updated:', {
    id: order.id,
    orderNumber: order.order_number,
    status: order.financial_status,
    fulfillmentStatus: order.fulfillment_status,
  });

  // TODO: Update order in your database
  // Example:
  // await db.order.update({
  //   where: { shopifyOrderId: order.id.toString() },
  //   data: {
  //     status: order.financial_status,
  //     fulfillmentStatus: order.fulfillment_status,
  //     updatedAt: new Date(order.updated_at),
  //   },
  // })

  // TODO: Send status update email to customer
}

/**
 * Handle order cancellation
 */
async function handleOrderCancelled(order: any) {
  console.log('❌ [Shopify Webhook] Order cancelled:', {
    id: order.id,
    orderNumber: order.order_number,
    cancelReason: order.cancel_reason,
  });

  // TODO: Update order status in database
  // TODO: Send cancellation email
  // TODO: Process refund if applicable
}

/**
 * Handle order paid
 */
async function handleOrderPaid(order: any) {
  console.log('💰 [Shopify Webhook] Order paid:', {
    id: order.id,
    orderNumber: order.order_number,
    total: order.total_price,
  });

  // TODO: Mark order as paid in database
  // TODO: Trigger fulfillment process
  // TODO: Send payment confirmation
}

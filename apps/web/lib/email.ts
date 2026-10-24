import { render } from '@react-email/render';
import AbandonedCartEmail from '@/emails/abandoned-cart';
import OrderCancellationEmail from '@/emails/order-cancellation';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import QuizResultsEmail from '@/emails/quiz-results';
import RestockReminderEmail from '@/emails/restock-reminder';
import ShippingUpdateEmail from '@/emails/shipping-update';
import WelcomeEmail from '@/emails/welcome';
import { sendEmail } from '@/lib/cloudflare-email';
import { getFromAddress, REPLY_TO } from '@/lib/email-config';
import { logger } from '@/lib/logger';
import { isUnsubscribed } from '@/lib/newsletter-subscribers';
import {
  getUnsubscribeHeaders,
  getUnsubscribeUrl,
  UNSUBSCRIBE_MAILTO,
} from '@/lib/unsubscribe';

// Sent from the onboarded subdomain; replies go to the shop inbox.
const FROM = getFromAddress();

const deliver = async (message: {
  to: string;
  subject: string;
  html: string;
  kind: string;
  /** Marketing emails: adds RFC 8058 one-click List-Unsubscribe headers. */
  marketing?: boolean;
}) => {
  const result = await sendEmail({
    from: FROM,
    to: message.to,
    replyTo: REPLY_TO,
    subject: message.subject,
    html: message.html,
    headers: {
      'X-Email-Kind': message.kind,
      ...(message.marketing ? await getUnsubscribeHeaders(message.to) : {}),
    },
  });
  if (!result.ok) {
    throw new Error(`Email send failed: ${result.code} ${result.message}`);
  }
};

/** The signed footer link for a marketing email; a mailto without the secret. */
const unsubscribeUrlFor = async (email: string) =>
  (await getUnsubscribeUrl(email)) ?? UNSUBSCRIBE_MAILTO;

interface OrderLineItem {
  title: string;
  quantity: number;
  price: number;
  image?: string;
  product_id?: string;
  handle?: string;
}

export async function sendOrderConfirmationEmail(order: {
  email: string;
  order_number: number | string;
  customer?: { first_name?: string };
  line_items: any[];
  subtotal_price: string;
  total_shipping_price_set?: { shop_money?: { amount: string } };
  total_price: string;
  currency: string;
  shipping_address?: any;
  order_status_url?: string;
}) {
  if (!order.email) return;

  const lineItems: OrderLineItem[] = (order.line_items || []).map(
    (item: any) => ({
      title: item.title || '',
      quantity: item.quantity || 1,
      price: parseFloat(item.price) || 0,
      image: item.image?.src || undefined,
    }),
  );

  const shippingAmount =
    order.total_shipping_price_set?.shop_money?.amount || '0.00';

  const html = await render(
    OrderConfirmationEmail({
      orderNumber: `#${order.order_number}`,
      customerName: order.customer?.first_name || 'there',
      lineItems,
      subtotal: order.subtotal_price,
      shipping: shippingAmount,
      total: order.total_price,
      currency: order.currency || 'GBP',
      shippingAddress: order.shipping_address,
      orderStatusUrl: order.order_status_url,
    }),
  );

  await deliver({
    to: order.email,
    subject: `Order confirmed: #${order.order_number}`,
    html,
    kind: 'order_confirmation',
  });

  logger.info('[Email] Order confirmation sent', {
    email: order.email,
    orderNumber: order.order_number,
  });
}

export async function sendShippingUpdateEmail(order: {
  email: string;
  order_number: number | string;
  customer?: { first_name?: string };
  fulfillments: any[];
  line_items: any[];
}) {
  if (!order.email) return;

  const fulfillment = order.fulfillments?.[0];
  if (!fulfillment) return;

  const lineItems = (order.line_items || []).map((item: any) => ({
    title: item.title || '',
    quantity: item.quantity || 1,
    image: item.image?.src || undefined,
  }));

  const html = await render(
    ShippingUpdateEmail({
      orderNumber: `#${order.order_number}`,
      customerName: order.customer?.first_name || 'there',
      trackingNumber: fulfillment.tracking_number || undefined,
      trackingUrl: fulfillment.tracking_url || undefined,
      carrier: fulfillment.tracking_company || undefined,
      lineItems,
    }),
  );

  await deliver({
    to: order.email,
    subject: `Your order #${order.order_number} is on its way!`,
    html,
    kind: 'shipping_update',
  });

  logger.info('[Email] Shipping update sent', {
    email: order.email,
    orderNumber: order.order_number,
  });
}

export async function sendAbandonedCartEmail(checkout: {
  email: string;
  checkoutUrl: string;
  lineItems: any[];
  totalPrice: string;
  currency: string;
  customerName?: string;
}) {
  if (!checkout.email) return;
  // Unsolicited marketing: respect an opt-out from any earlier email.
  if (await isUnsubscribed(checkout.email)) {
    logger.info('[Email] Abandoned cart skipped, unsubscribed', {
      email: checkout.email,
    });
    return;
  }

  const lineItems = (checkout.lineItems || []).map((item: any) => ({
    title: item.title || '',
    price: parseFloat(item.price) || 0,
    quantity: item.quantity || 1,
    image: item.image?.src || item.image || undefined,
  }));

  const html = await render(
    AbandonedCartEmail({
      customerName: checkout.customerName,
      lineItems,
      totalPrice: checkout.totalPrice,
      currency: checkout.currency || 'GBP',
      checkoutUrl: checkout.checkoutUrl,
      unsubscribeUrl: await unsubscribeUrlFor(checkout.email),
    }),
  );

  await deliver({
    to: checkout.email,
    subject: 'You left something beautiful behind',
    html,
    kind: 'abandoned_cart',
    marketing: true,
  });

  logger.info('[Email] Abandoned cart email sent', { email: checkout.email });
}

export async function sendRestockReminderEmail(data: {
  email: string;
  customerName?: string;
  lineItems: Array<{ title: string; handle?: string; image?: string }>;
}) {
  if (!data.email) return;
  // Unsolicited marketing: respect an opt-out from any earlier email.
  if (await isUnsubscribed(data.email)) {
    logger.info('[Email] Restock reminder skipped, unsubscribed', {
      email: data.email,
    });
    return;
  }

  const html = await render(
    RestockReminderEmail({
      customerName: data.customerName,
      lineItems: data.lineItems,
      unsubscribeUrl: await unsubscribeUrlFor(data.email),
    }),
  );

  await deliver({
    to: data.email,
    subject: 'Time to restock? Your favourites are waiting',
    html,
    kind: 'restock_reminder',
    marketing: true,
  });

  logger.info('[Email] Restock reminder sent', { email: data.email });
}

export async function sendWelcomeEmail(data: { email: string; name?: string }) {
  if (!data.email) return;

  const html = await render(
    WelcomeEmail({
      customerName: data.name,
      unsubscribeUrl: await unsubscribeUrlFor(data.email),
    }),
  );

  await deliver({
    to: data.email,
    subject: "Welcome to Auntie Marlene's",
    html,
    kind: 'welcome',
    marketing: true,
  });

  logger.info('[Email] Welcome email sent', { email: data.email });
}

export async function sendOrderCancellationEmail(order: {
  email: string;
  order_number: number | string;
  customer?: { first_name?: string };
  cancel_reason?: string;
}) {
  if (!order.email) return;

  const html = await render(
    OrderCancellationEmail({
      orderNumber: `#${order.order_number}`,
      customerName: order.customer?.first_name || 'there',
      cancelReason: order.cancel_reason,
    }),
  );

  await deliver({
    to: order.email,
    subject: `Your order #${order.order_number} has been cancelled`,
    html,
    kind: 'order_cancellation',
  });

  logger.info('[Email] Cancellation email sent', {
    email: order.email,
    orderNumber: order.order_number,
  });
}

export async function sendQuizResultsEmail(data: {
  email: string;
  quizType: 'hair' | 'skin';
  customerName?: string;
  results: Record<string, string>;
  recommendations: Array<{ name: string; handle: string; reason: string }>;
}) {
  if (!data.email) return;

  const html = await render(
    QuizResultsEmail({
      quizType: data.quizType,
      customerName: data.customerName,
      results: data.results,
      recommendations: data.recommendations,
      unsubscribeUrl: await unsubscribeUrlFor(data.email),
    }),
  );

  const typeLabel = data.quizType === 'hair' ? 'hair' : 'skin';

  await deliver({
    to: data.email,
    subject: `Your personalized ${typeLabel} care routine`,
    html,
    kind: 'quiz_results',
    marketing: true,
  });

  logger.info('[Email] Quiz results email sent', { email: data.email });
}

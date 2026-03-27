import resend from '@/lib/resend';
import { render } from '@react-email/render';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import AbandonedCartEmail from '@/emails/abandoned-cart';
import ShippingUpdateEmail from '@/emails/shipping-update';
import RestockReminderEmail from '@/emails/restock-reminder';

const FROM = "Auntie Marlene's <hello@auntiemarlenes.com>";

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

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Order confirmed — #${order.order_number}`,
    html,
  });

  console.log(
    `[Email] Order confirmation sent to ${order.email} for #${order.order_number}`,
  );
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

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Your order #${order.order_number} is on its way!`,
    html,
  });

  console.log(
    `[Email] Shipping update sent to ${order.email} for #${order.order_number}`,
  );
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
    }),
  );

  await resend.emails.send({
    from: FROM,
    to: checkout.email,
    subject: 'You left something beautiful behind',
    html,
  });

  console.log(`[Email] Abandoned cart email sent to ${checkout.email}`);
}

export async function sendRestockReminderEmail(data: {
  email: string;
  customerName?: string;
  lineItems: Array<{ title: string; handle?: string; image?: string }>;
}) {
  if (!data.email) return;

  const html = await render(
    RestockReminderEmail({
      customerName: data.customerName,
      lineItems: data.lineItems,
    }),
  );

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: 'Time to restock? Your favourites are waiting',
    html,
  });

  console.log(`[Email] Restock reminder sent to ${data.email}`);
}

import Header from './Header';
import { getCart } from '@/app/actions';
import BagIconClient from './BagIconClient';

export default async function HeaderWrapper() {
  const cart = await getCart();

  const bagCount =
    cart?.lines.edges.reduce(
      (count: number, edge: any) => count + edge.node.quantity,
      0,
    ) || 0;

  const lines = cart?.lines.edges.map((edge: any) => edge.node) || [];
  const subtotal = parseFloat(cart?.cost?.subtotalAmount?.amount || '0');
  const checkoutUrl = cart?.checkoutUrl;

  return (
    <Header
      bagSlot={
        <BagIconClient
          cartId={cart?.id}
          bagCount={bagCount}
          lines={lines}
          subtotal={subtotal}
          checkoutUrl={checkoutUrl}
        />
      }
    />
  );
}

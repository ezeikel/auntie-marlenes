'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart } from '@/app/actions';
import BagIconClient from './BagIconClient';
import BagSkeleton from './BagSkeleton';

export default function BagIconDynamic() {
  const router = useRouter();
  const [cartData, setCartData] = useState<{
    cartId?: string;
    bagCount: number;
    lines: any[];
    subtotal: number;
    checkoutUrl?: string;
  }>({
    bagCount: 0,
    lines: [],
    subtotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const cart = await getCart();

      const bagCount =
        cart?.lines.edges.reduce(
          (acc: number, lineItem: any) => acc + lineItem.node.quantity,
          0,
        ) || 0;

      const subtotal = cart?.cost.subtotalAmount
        ? parseFloat(cart.cost.subtotalAmount.amount)
        : 0;
      const lines = cart?.lines.edges.map((edge: any) => edge.node) || [];
      const checkoutUrl = cart?.checkoutUrl;

      setCartData({
        cartId: cart?.id,
        bagCount,
        lines,
        subtotal,
        checkoutUrl,
      });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Listen for route changes and refetch cart
  useEffect(() => {
    const handleRouteChange = () => {
      fetchCart();
    };

    // Listen to Next.js router events
    router.refresh();

    return () => {
      // Cleanup if needed
    };
  }, [router]);

  if (isLoading) {
    return <BagSkeleton />;
  }

  return (
    <BagIconClient
      cartId={cartData.cartId}
      bagCount={cartData.bagCount}
      lines={cartData.lines}
      subtotal={cartData.subtotal}
      checkoutUrl={cartData.checkoutUrl}
    />
  );
}

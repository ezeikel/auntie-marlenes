'use client';

import { useState, useOptimistic, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag } from '@fortawesome/pro-regular-svg-icons';
import { removeProductFromCart, updateCartLineQuantity } from '@/app/actions';
import BagPopover from './BagPopover';

type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: {
      amount: string;
      currencyCode: string;
    };
    image?: {
      url: string;
      altText?: string;
    };
    product: {
      id: string;
      title: string;
      vendor: string;
      images?: {
        edges: Array<{
          node: {
            url: string;
            altText?: string;
          };
        }>;
      };
    };
  };
};

type BagIconClientProps = {
  cartId?: string;
  bagCount: number;
  lines: CartLine[];
  subtotal: number;
  checkoutUrl?: string;
};

export default function BagIconClient({
  cartId,
  bagCount,
  lines,
  subtotal,
  checkoutUrl,
}: BagIconClientProps) {
  const [bagOpen, setBagOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  type OptimisticState = {
    lines: CartLine[];
    subtotal: number;
    bagCount: number;
  };

  const [optimisticState, updateOptimisticState] = useOptimistic<
    OptimisticState,
    { type: 'update' | 'remove'; lineId: string; quantity?: number }
  >({ lines, subtotal, bagCount }, (state, action) => {
    if (action.type === 'remove') {
      const removedLine = state.lines.find((l) => l.id === action.lineId);
      if (!removedLine) return state;

      const lineTotal =
        parseFloat(removedLine.merchandise.priceV2.amount) *
        removedLine.quantity;
      const newLines = state.lines.filter((l) => l.id !== action.lineId);
      return {
        lines: newLines,
        subtotal: state.subtotal - lineTotal,
        bagCount: newLines.reduce((acc, l) => acc + l.quantity, 0),
      };
    }

    if (action.type === 'update' && action.quantity !== undefined) {
      const line = state.lines.find((l) => l.id === action.lineId);
      if (!line) return state;

      const price = parseFloat(line.merchandise.priceV2.amount);
      const oldTotal = price * line.quantity;
      const newTotal = price * action.quantity;
      const newLines = state.lines.map((l) =>
        l.id === action.lineId ? { ...l, quantity: action.quantity! } : l,
      );

      return {
        lines: newLines,
        subtotal: state.subtotal - oldTotal + newTotal,
        bagCount: newLines.reduce((acc, l) => acc + l.quantity, 0),
      };
    }

    return state;
  });

  const handleRemoveItem = async (lineId: string) => {
    startTransition(async () => {
      updateOptimisticState({ type: 'remove', lineId });
      try {
        await removeProductFromCart({ cartId: cartId!, lineIds: [lineId] });
      } catch (error) {
        console.error('Failed to remove item:', error);
      }
    });
  };

  const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await handleRemoveItem(lineId);
      return;
    }
    if (newQuantity < 0) return;

    startTransition(async () => {
      updateOptimisticState({ type: 'update', lineId, quantity: newQuantity });
      try {
        await updateCartLineQuantity({
          cartId: cartId!,
          lineId,
          quantity: newQuantity,
        });
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    });
  };

  if (optimisticState.bagCount === 0 || !cartId) {
    // Empty bag - just show link to bag page
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10"
        asChild
      >
        <Link href="/bag">
          <FontAwesomeIcon
            icon={faShoppingBag}
            size="lg"
            className="text-gray-600"
          />
          <span className="sr-only">Shopping Bag</span>
        </Link>
      </Button>
    );
  }

  // Bag has items - show popover on hover
  return (
    <Popover open={bagOpen} onOpenChange={setBagOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10"
          onMouseEnter={() => setBagOpen(true)}
        >
          <FontAwesomeIcon
            icon={faShoppingBag}
            size="lg"
            className="text-gray-600"
          />
          <span className="sr-only">Shopping Bag</span>
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-terracotta text-white text-xs font-bold flex items-center justify-center">
            {optimisticState.bagCount}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 border-0 shadow-none"
        align="end"
        onMouseLeave={() => setBagOpen(false)}
      >
        <BagPopover
          cartId={cartId}
          lines={optimisticState.lines}
          subtotal={optimisticState.subtotal}
          checkoutUrl={checkoutUrl}
          onClose={() => setBagOpen(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
      </PopoverContent>
    </Popover>
  );
}

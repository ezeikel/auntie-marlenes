'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  addProductsToCart,
  createCart,
  getCart,
  getProductVariantId,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { TRACKING_EVENTS } from '@/constants/events';
import { logger } from '@/lib/logger';
import { useAnalytics } from '@/utils/analytics-client';

type AddToBagButtonProps = {
  productId: string;
  productName?: string;
  productPrice?: number;
  currency?: string;
  selectedOptions?: Record<string, string>;
  onSuccess?: () => void;
  buttonText?: string;
  buttonClassName?: string;
};

const AddToBagButton = ({
  productId,
  productName,
  productPrice,
  currency,
  selectedOptions,
  onSuccess,
  buttonText = 'ADD TO BAG',
  buttonClassName,
}: AddToBagButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { track } = useAnalytics();

  const handleAddToBag = () => {
    // Track add to bag initiated
    track(TRACKING_EVENTS.ADD_TO_BAG_CLICKED, {
      product_id: productId,
      selected_options: JSON.stringify(selectedOptions),
    });

    setError(null);

    // Wrap the entire async operation in startTransition for immediate UI feedback
    startTransition(async () => {
      try {
        // Get the variant ID for the product (or first variant if no options)
        const productVariantId = await getProductVariantId({
          productId,
          selectedOptions,
        });

        if (!productVariantId) {
          setError('No variant found for product');
          console.error('❌ [AddToBag] No variant found for product');

          // Track failure
          track(TRACKING_EVENTS.ADD_TO_BAG_FAILED, {
            product_id: productId,
            selected_options: JSON.stringify(selectedOptions),
            error: 'No variant found for product',
          });

          logger.warn('No variant found for product', {
            productId,
            selectedOptions: JSON.stringify(selectedOptions),
          });

          return;
        }

        const cart = await getCart();

        if (cart) {
          // add to existing cart
          await addProductsToCart({
            cartId: cart.id,
            productVariantId,
          });
        } else {
          // create a new cart
          await createCart({
            productVariantId,
          });
        }

        // Track success
        track(TRACKING_EVENTS.PRODUCT_ADDED_TO_BAG, {
          product_id: productId,
          variant_id: productVariantId,
          selected_options: JSON.stringify(selectedOptions),
          product_name: productName,
          product_price: productPrice,
          currency,
        });

        logger.info('Product added to bag', {
          productId,
          variantId: productVariantId,
          cartAction: cart ? 'added_to_existing' : 'created_new_cart',
        });

        // Show success toast
        toast.success(`${productName || 'Item'} added to bag`, {
          action: {
            label: 'View Bag',
            onClick: () => router.push('/bag'),
          },
        });

        // Refresh the page to update cart count in header
        router.refresh();

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        console.error('❌ [AddToBag] Error adding to bag:', err);
        setError('Failed to add item to bag');
        toast.error('Failed to add item to bag. Please try again.');

        // Track error
        track(TRACKING_EVENTS.ADD_TO_BAG_FAILED, {
          product_id: productId,
          selected_options: JSON.stringify(selectedOptions),
          error: err instanceof Error ? err.message : 'Unknown error',
        });

        logger.error(
          'Failed to add product to bag',
          err instanceof Error ? err : new Error('Unknown error'),
          {
            productId,
            selectedOptions: JSON.stringify(selectedOptions),
          },
        );
      }
    });
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleAddToBag}
        disabled={isPending}
        size="lg"
        className={
          buttonClassName ||
          'w-full bg-sage-green hover:bg-sage-green/90 text-white font-bold text-lg h-14 rounded-lg'
        }
      >
        {isPending ? 'ADDING...' : buttonText}
      </Button>
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="text-sm text-red-600 mt-1"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default AddToBagButton;

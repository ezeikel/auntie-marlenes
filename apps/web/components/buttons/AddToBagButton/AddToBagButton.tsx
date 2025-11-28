'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  getCart,
  createCart,
  getProductVariantId,
  addProductsToCart,
} from '@/app/actions';
import { useRouter } from 'next/navigation';
import { track } from '@/utils/analytics-client';
import { logger } from '@/lib/logger';

type AddToBagButtonProps = {
  productId: string;
  selectedOptions?: Record<string, string>;
  onSuccess?: () => void;
  buttonText?: string;
  buttonClassName?: string;
};

const AddToBagButton = ({
  productId,
  selectedOptions,
  onSuccess,
  buttonText = 'ADD TO BAG',
  buttonClassName,
}: AddToBagButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAddToBag = () => {
    console.log('🛒 [AddToBag] Button clicked!', {
      productId,
      selectedOptions,
    });

    // Track add to bag initiated
    track('Add to Bag Clicked', {
      product_id: productId,
      selected_options: JSON.stringify(selectedOptions),
    });

    setError(null);

    // Wrap the entire async operation in startTransition for immediate UI feedback
    startTransition(async () => {
      try {
        // Get the variant ID for the product (or first variant if no options)
        console.log('🛒 [AddToBag] Getting product variant ID...');
        const productVariantId = await getProductVariantId({
          productId,
          selectedOptions,
        });

        console.log('🛒 [AddToBag] Got variant ID:', productVariantId);

        if (!productVariantId) {
          setError('No variant found for product');
          console.error('❌ [AddToBag] No variant found for product');

          // Track failure
          track('Add to Bag Failed', {
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

        console.log('🛒 [AddToBag] Getting existing cart...');
        const cart = await getCart();
        console.log(
          '🛒 [AddToBag] Cart:',
          cart ? `Found (ID: ${cart.id})` : 'Not found',
        );

        if (cart) {
          // add to existing cart
          console.log('🛒 [AddToBag] Adding to existing cart...');
          await addProductsToCart({
            cartId: cart.id,
            productVariantId,
          });
          console.log('✅ [AddToBag] Added to existing cart successfully');
        } else {
          // create a new cart
          console.log('🛒 [AddToBag] Creating new cart...');
          await createCart({
            productVariantId,
          });
          console.log('✅ [AddToBag] Created new cart successfully');
        }

        // Track success
        track('Product Added to Bag', {
          product_id: productId,
          variant_id: productVariantId,
          selected_options: JSON.stringify(selectedOptions),
          cart_action: cart ? 'added_to_existing' : 'created_new_cart',
        });

        logger.info('Product added to bag', {
          productId,
          variantId: productVariantId,
          cartAction: cart ? 'added_to_existing' : 'created_new_cart',
        });

        // Refresh the page to update cart count in header
        console.log('🔄 [AddToBag] Refreshing page...');
        router.refresh();
        console.log('✅ [AddToBag] Complete!');

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        console.error('❌ [AddToBag] Error adding to bag:', err);
        setError('Failed to add item to bag');

        // Track error
        track('Add to Bag Failed', {
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
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default AddToBagButton;

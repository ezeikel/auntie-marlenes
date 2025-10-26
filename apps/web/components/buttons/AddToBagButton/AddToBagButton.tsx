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

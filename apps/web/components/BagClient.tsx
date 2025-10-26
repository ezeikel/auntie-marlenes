'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faHeart,
  faTruck,
  faClock,
} from '@fortawesome/pro-regular-svg-icons';
import { formatCurrency } from '@/lib/currency';
import ProductCard from '@/components/ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { removeProductFromCart, updateCartLineQuantity } from '@/app/actions';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/constants';

type BagClientProps = {
  cart: any;
  recommendedProducts: Product[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export default function BagClient({
  cart,
  recommendedProducts,
  subtotal,
  deliveryFee,
  total,
}: BagClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemoveItem = async (lineId: string) => {
    try {
      await removeProductFromCart({
        cartId: cart.id,
        lineIds: [lineId],
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleUpdateQuantity = async (lineId: string, quantity: number) => {
    try {
      await updateCartLineQuantity({
        cartId: cart.id,
        lineId,
        quantity,
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleCheckout = () => {
    // Redirect to Shopify checkout
    if (cart.checkoutUrl) {
      const checkoutUrl = cart.checkoutUrl;

      // If you have a storefront password set, you can bypass it by adding the password as a query parameter
      // Uncomment and add your password if needed during development:
      // const storefrontPassword = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PASSWORD
      // if (storefrontPassword) {
      //   checkoutUrl += `${checkoutUrl.includes('?') ? '&' : '?'}password=${storefrontPassword}`
      // }

      window.location.href = checkoutUrl;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Urgency Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <FontAwesomeIcon icon={faClock} className="text-amber-600" size="lg" />
        <p className="text-sm font-medium text-amber-900">
          <strong>HURRY!</strong> Items in your bag are reserved for 60 minutes
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Bag Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-cocoa mb-6">
              MY BAG
            </h1>

            <div className="space-y-6">
              {cart.lines.edges.map(({ node }: any) => {
                const product = node.merchandise.product;
                const variant = node.merchandise;
                const price = parseFloat(variant.priceV2.amount);
                const compareAtPrice = variant.compareAtPriceV2
                  ? parseFloat(variant.compareAtPriceV2.amount)
                  : undefined;
                const itemTotal = price * node.quantity;
                const imageUrl =
                  variant.image?.url ||
                  product.images?.edges[0]?.node.url ||
                  '/placeholder.svg';

                return (
                  <div
                    key={node.id}
                    className="flex gap-4 pb-6 border-b border-gray-200 last:border-0"
                  >
                    <Link
                      href={`/product/${product.handle}`}
                      className="relative w-28 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <Link href={`/product/${product.handle}`}>
                            <h3 className="font-semibold text-cocoa hover:text-terracotta line-clamp-2 mb-1">
                              {product.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600">
                            {product.vendor}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {compareAtPrice && compareAtPrice > price && (
                            <p className="text-sm text-gray-500 line-through">
                              {formatCurrency(
                                compareAtPrice * node.quantity,
                                'GBP',
                              )}
                            </p>
                          )}
                          <p className="text-lg font-bold text-cocoa">
                            {formatCurrency(itemTotal, 'GBP')}
                          </p>
                        </div>
                      </div>

                      {variant.title !== 'Default Title' && (
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Variant:</span>{' '}
                          {variant.title}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`qty-${node.id}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Qty:
                          </label>
                          <Select
                            value={node.quantity.toString()}
                            onValueChange={(value) =>
                              handleUpdateQuantity(
                                node.id,
                                Number.parseInt(value),
                              )
                            }
                            disabled={isPending}
                          >
                            <SelectTrigger
                              id={`qty-${node.id}`}
                              className="w-20 h-9 bg-white"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(node.id)}
                          disabled={isPending}
                          className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-playfair font-bold text-cocoa mb-4">
                A Little Something Extra?
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {recommendedProducts.length} items
              </p>

              <Carousel
                opts={{
                  align: 'start',
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {recommendedProducts.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="pl-4 basis-1/2 md:basis-1/3"
                    >
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex -left-4" />
                <CarouselNext className="hidden sm:flex -right-4" />
              </Carousel>
            </div>
          )}

          {/* Delivery Info */}
          <div className="bg-sage-green/5 border border-sage-green/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={faTruck}
                className="text-sage-green mt-1"
                size="lg"
              />
              <div>
                <h3 className="font-semibold text-cocoa mb-1">
                  FREE* STANDARD DELIVERY
                </h3>
                <p className="text-sm text-gray-700">
                  Faster delivery options available to most countries.
                </p>
                <Link
                  href="/delivery"
                  className="text-sm text-sage-green font-semibold hover:underline mt-2 inline-block"
                >
                  More info
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-playfair font-bold text-cocoa mb-6">
              TOTAL
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Sub-total</span>
                <span className="font-semibold text-cocoa">
                  {formatCurrency(subtotal, 'GBP')}
                </span>
              </div>

              <div className="flex justify-between text-sm items-center">
                <div className="flex items-center gap-1">
                  <span className="text-gray-700">Delivery</span>
                </div>
                <span className="font-semibold text-cocoa">
                  {deliveryFee === 0
                    ? 'FREE'
                    : formatCurrency(deliveryFee, 'GBP')}
                </span>
              </div>

              {subtotal < 40 && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  Add {formatCurrency(40 - subtotal, 'GBP')} more to qualify for
                  free delivery
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-cocoa">
                  {formatCurrency(total, 'GBP')}
                </span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isPending}
              className="w-full bg-sage-green hover:bg-sage-green/90 text-white font-bold text-lg h-12 mb-3"
            >
              {isPending ? 'Processing...' : 'CHECKOUT'}
            </Button>

            <div className="text-center mb-4">
              <p className="text-xs text-gray-600">WE ACCEPT:</p>
              <div className="flex justify-center gap-2 mt-2 flex-wrap">
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                  VISA
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                  MC
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                  AMEX
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                  PP
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600 text-center">
              <p>Got a discount code? Add it in the next step.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { faCircleCheck } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TRACKING_EVENTS } from '@/constants/events';
import { useAnalytics } from '@/utils/analytics-client';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const { track } = useAnalytics();

  useEffect(() => {
    const trackPurchaseEvent = async () => {
      // Extract order details from URL parameters
      // Shopify can pass these via redirect URL parameters
      const orderId =
        searchParams.get('order_id') || searchParams.get('checkout_id');
      const orderName = searchParams.get('order_name');
      const total = searchParams.get('total') || searchParams.get('amount');
      const currency = searchParams.get('currency') || 'GBP';
      const email = searchParams.get('email');
      const itemCount = searchParams.get('item_count');

      // Track purchase with Facebook Pixel
      if (orderId && total) {
        const purchaseValue = parseFloat(total);

        // Import Facebook Pixel utilities dynamically
        const { waitForFacebookPixel, trackPurchase } = await import(
          '@/utils/facebook-pixel'
        );

        // Wait for pixel to be ready
        await waitForFacebookPixel();

        // Track with Facebook Pixel
        trackPurchase({
          value: purchaseValue,
          currency: currency,
          order_id: orderId,
          content_type: 'product',
          num_items: itemCount ? parseInt(itemCount) : undefined,
        });

        // Track with internal analytics
        track(TRACKING_EVENTS.CHECKOUT_COMPLETED, {
          order_id: orderId,
          order_name: orderName || orderId,
          total_amount: purchaseValue,
          currency: currency,
          customer_email: email || '',
        });

        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('[Thank You Page] Purchase tracked:', {
            orderId,
            orderName,
            value: purchaseValue,
            currency,
            email,
            itemCount,
          });
        }
      } else {
        // If no order details in URL, still track page view
        console.log('[Thank You Page] No order details found in URL params');
        console.log(
          'Available params:',
          Object.fromEntries(searchParams.entries()),
        );
      }
    };

    trackPurchaseEvent();
  }, [searchParams, track]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="text-5xl text-green-600"
            />
          </div>
        </div>

        {/* Thank You Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Thank You!</h1>
          <p className="text-xl text-gray-600">
            Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details */}
        {searchParams.get('order_name') && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-2">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-lg font-semibold text-gray-900">
              {searchParams.get('order_name')}
            </p>
            {searchParams.get('email') && (
              <>
                <p className="text-sm text-gray-500 mt-4">
                  A confirmation email has been sent to:
                </p>
                <p className="text-gray-900">{searchParams.get('email')}</p>
              </>
            )}
          </div>
        )}

        {/* What's Next */}
        <div className="space-y-4">
          <p className="text-gray-600">
            We're preparing your order for shipment. You'll receive an email
            with tracking information once your order ships.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account/orders">
            <Button size="lg">View Order Details</Button>
          </Link>
          <Link href="/shop">
            <Button size="lg" variant="outline">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Additional Information */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Have questions about your order?{' '}
            <Link href="/contact" className="text-cocoa hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

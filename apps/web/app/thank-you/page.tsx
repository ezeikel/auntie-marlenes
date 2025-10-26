import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';

type ThankYouPageProps = {
  searchParams: Promise<{
    order_id?: string;
    order_number?: string;
  }>;
};

export default async function ThankYouPage({
  searchParams,
}: ThankYouPageProps) {
  const params = await searchParams;
  const orderId = params.order_id;
  const orderNumber = params.order_number;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-green/10">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-sage-green"
              size="3x"
            />
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4">
          Thank You for Your Order!
        </h1>

        {orderNumber && (
          <p className="text-lg text-gray-600 mb-6">Order #{orderNumber}</p>
        )}

        <p className="text-gray-700 mb-8 max-w-md mx-auto">
          We've received your order and will send you a confirmation email
          shortly with tracking details.
        </p>

        {/* Order Details */}
        <div className="bg-sage-green/5 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-cocoa mb-4">What happens next?</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-sage-green font-bold">1.</span>
              <span>You'll receive an order confirmation email</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sage-green font-bold">2.</span>
              <span>We'll prepare your items for dispatch</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sage-green font-bold">3.</span>
              <span>
                You'll receive a shipping notification with tracking information
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sage-green font-bold">4.</span>
              <span>Your order will arrive within 3-5 business days (UK)</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-sage-green hover:bg-sage-green/90 text-white font-bold"
            size="lg"
          >
            <Link href="/shop">Continue Shopping</Link>
          </Button>

          {orderId && (
            <Button
              asChild
              variant="outline"
              className="border-2 border-cocoa text-cocoa hover:bg-cocoa hover:text-white font-bold"
              size="lg"
            >
              <Link href={`/account/orders/${orderId}`}>View Order</Link>
            </Button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link
              href="/contact"
              className="text-sage-green hover:underline font-semibold"
            >
              Contact our customer service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

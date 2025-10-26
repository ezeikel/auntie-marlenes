import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons';

type CheckoutFailedPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function CheckoutFailedPage({
  searchParams,
}: CheckoutFailedPageProps) {
  const params = await searchParams;
  const reason = params.reason;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-red-500"
              size="3x"
            />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4">
          Payment Unsuccessful
        </h1>

        <p className="text-gray-700 mb-8 max-w-md mx-auto">
          {reason === 'cancelled'
            ? 'Your payment was cancelled. No charges have been made to your account.'
            : "We couldn't process your payment. Please try again or use a different payment method."}
        </p>

        {/* Common Issues */}
        <div className="bg-amber-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-cocoa mb-4">Common Issues:</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-amber-600">•</span>
              <span>Insufficient funds in your account</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600">•</span>
              <span>Incorrect card details or expired card</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600">•</span>
              <span>
                Card declined by your bank (contact your bank for details)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600">•</span>
              <span>Payment timeout due to slow connection</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            asChild
            className="bg-sage-green hover:bg-sage-green/90 text-white font-bold"
            size="lg"
          >
            <Link href="/bag">Return to Cart</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-2 border-cocoa text-cocoa hover:bg-cocoa hover:text-white font-bold"
            size="lg"
          >
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>

        {/* Help Section */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Your items are still in your cart and will be reserved for 60
            minutes.
          </p>
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

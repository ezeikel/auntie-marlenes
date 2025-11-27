import { setRequestLocale } from 'next-intl/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faRotateLeft,
  faBox,
  faGlobe,
} from '@fortawesome/pro-regular-svg-icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delivery & Returns',
  description:
    'Learn about our delivery options, international shipping, and hassle-free returns policy at Auntie Marlene\'s.',
};

type DeliveryReturnsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DeliveryReturnsPage({ params }: DeliveryReturnsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-playfair font-bold text-cocoa mb-8">
            Delivery & Returns
          </h1>

          {/* UK Delivery */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faTruck}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                UK Delivery
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  Free Standard Delivery
                </h3>
                <p className="text-sm">
                  Enjoy FREE standard delivery on all UK orders over £40.
                  Orders under £40 will be charged a delivery fee of £3.95.
                </p>
                <p className="text-sm mt-2">
                  <strong>Delivery time:</strong> 3-5 business days
                </p>
              </div>

              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  Next-Day Delivery
                </h3>
                <p className="text-sm">
                  Need your products faster? We offer next-day delivery for
                  £5.95 on orders placed before 2pm (Monday-Friday).
                </p>
                <p className="text-sm mt-2">
                  <strong>Note:</strong> Next-day delivery is available to most
                  UK addresses excluding Scottish Highlands, Northern Ireland,
                  and offshore islands.
                </p>
              </div>
            </div>
          </section>

          {/* International Shipping */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faGlobe}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                International Shipping
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                We're proud to ship worldwide! We currently offer shipping to
                the following regions:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-cocoa mb-2">
                    🇺🇸 United States
                  </h3>
                  <p className="text-sm">
                    <strong>Minimum order:</strong> £30
                    <br />
                    <strong>Delivery time:</strong> 7-14 business days
                    <br />
                    <strong>Shipping cost:</strong> Calculated at checkout
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-cocoa mb-2">
                    🇦🇪 United Arab Emirates
                  </h3>
                  <p className="text-sm">
                    <strong>Minimum order:</strong> £30
                    <br />
                    <strong>Delivery time:</strong> 5-10 business days
                    <br />
                    <strong>Shipping cost:</strong> Calculated at checkout
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-cocoa mb-2">
                    🇪🇺 European Union
                  </h3>
                  <p className="text-sm">
                    <strong>Minimum order:</strong> £25
                    <br />
                    <strong>Delivery time:</strong> 5-10 business days
                    <br />
                    <strong>Shipping cost:</strong> Calculated at checkout
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-cocoa mb-2">
                    🌍 Rest of World
                  </h3>
                  <p className="text-sm">
                    <strong>Minimum order:</strong> £35
                    <br />
                    <strong>Delivery time:</strong> 10-21 business days
                    <br />
                    <strong>Shipping cost:</strong> Calculated at checkout
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Important Information for International Orders
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>
                    Customs duties and taxes may apply to your order depending
                    on your country's regulations
                  </li>
                  <li>
                    You are responsible for any customs charges or import taxes
                  </li>
                  <li>
                    Delivery times are estimates and may vary based on customs
                    processing
                  </li>
                  <li>
                    All international shipping costs are calculated based on
                    weight and destination
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Order Tracking */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faBox}
                className="text-deep-earth"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Order Tracking
              </h2>
            </div>

            <div className="text-gray-700 space-y-3">
              <p>
                Once your order has been dispatched, you'll receive a tracking
                number via email. You can use this to track your parcel's
                journey to your door.
              </p>
              <p>
                If you have any issues with tracking your order, please{' '}
                <a
                  href="mailto:hello@auntiemarlenes.com"
                  className="text-sage-green font-semibold hover:underline"
                >
                  contact us
                </a>{' '}
                and we'll be happy to help.
              </p>
            </div>
          </section>

          {/* Returns Policy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faRotateLeft}
                className="text-terracotta"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Returns Policy
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                Your satisfaction is our priority. If you're not completely
                happy with your purchase, we accept returns within{' '}
                <strong>30 days</strong> of delivery.
              </p>

              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  How to Return an Item
                </h3>
                <ol className="space-y-2 list-decimal list-inside text-sm">
                  <li>
                    Contact us at{' '}
                    <a
                      href="mailto:hello@auntiemarlenes.com"
                      className="text-sage-green font-semibold hover:underline"
                    >
                      hello@auntiemarlenes.com
                    </a>{' '}
                    to request a return
                  </li>
                  <li>
                    We'll provide you with a returns label and instructions
                  </li>
                  <li>
                    Pack the item securely in its original packaging if possible
                  </li>
                  <li>Attach the returns label and send it back to us</li>
                  <li>
                    Once we receive and inspect your return, we'll process your
                    refund within 5-7 business days
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Return Conditions
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Items must be unused and in original condition</li>
                  <li>
                    Original packaging and all tags must be intact where
                    applicable
                  </li>
                  <li>
                    For hygiene reasons, we cannot accept returns on opened hair
                    care products or wigs that have been worn
                  </li>
                  <li>
                    Return shipping costs are the responsibility of the customer
                    unless the item is faulty
                  </li>
                </ul>
              </div>

              <p className="text-sm">
                <strong>Damaged or Faulty Items:</strong> If your item arrives
                damaged or faulty, please contact us immediately with photos.
                We'll arrange a free return and send you a replacement or full
                refund.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mt-12 bg-sage-green/10 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-cocoa mb-2">
              Need Help?
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Our customer service team is here to help with any questions about
              delivery or returns.
            </p>
            <a
              href="mailto:hello@auntiemarlenes.com"
              className="inline-block px-6 py-3 bg-sage-green hover:bg-sage-green/90 text-white font-bold rounded-md transition-colors"
            >
              Contact Us
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

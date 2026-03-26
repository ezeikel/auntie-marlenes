import { setRequestLocale } from 'next-intl/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileContract,
  faBasketShopping,
  faCreditCard,
  faTruck,
  faRotateLeft,
  faShieldCheck,
  faScaleBalanced,
  faGavel,
  faPenToSquare,
  faEnvelope,
} from '@fortawesome/pro-regular-svg-icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    "Read the terms and conditions for shopping at Auntie Marlene's, including ordering, delivery, returns, and more.",
};

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-playfair font-bold text-cocoa mb-4">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

          {/* Acceptance */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faFileContract}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Acceptance of Terms
              </h2>
            </div>

            <div className="text-gray-700 space-y-3">
              <p>
                Welcome to Auntie Marlene's. By accessing our website and
                placing an order, you agree to be bound by these terms and
                conditions. If you don't agree with any part of these terms,
                please don't use our site.
              </p>
              <p>
                These terms apply to all visitors, customers, and anyone else
                who accesses or uses our website. We recommend reading them
                carefully before making a purchase.
              </p>
            </div>
          </section>

          {/* Products & Pricing */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faBasketShopping}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Products & Pricing
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                All prices on our website are displayed in British Pounds
                Sterling (GBP) and include VAT where applicable.
              </p>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  Product Information
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>
                    We do our best to ensure all product descriptions, images,
                    and prices are accurate. However, errors may occasionally
                    occur.
                  </li>
                  <li>
                    Product images are for illustration purposes. Actual
                    products may vary slightly in colour or appearance due to
                    screen settings.
                  </li>
                  <li>
                    We reserve the right to update prices at any time without
                    prior notice. The price at the time you place your order is
                    the price you pay.
                  </li>
                  <li>
                    If we discover a pricing error after you've placed an order,
                    we'll contact you before processing it and give you the
                    option to proceed or cancel.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Ordering & Payment */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faCreditCard}
                className="text-terracotta"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Ordering & Payment
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                When you place an order through our website, you're making an
                offer to purchase. We'll confirm your order via email once it
                has been accepted and processed.
              </p>

              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  Checkout & Payment
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>
                    All payments are securely processed through Shopify's
                    checkout system. We never store your full payment details on
                    our servers.
                  </li>
                  <li>
                    We accept major credit and debit cards, Apple Pay, Google
                    Pay, and other payment methods available through Shopify.
                  </li>
                  <li>Payment is taken at the time you place your order.</li>
                  <li>
                    We reserve the right to refuse or cancel any order if we
                    suspect fraud, if a product is out of stock, or for any
                    other legitimate reason. In such cases, you'll receive a
                    full refund.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Delivery */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faTruck}
                className="text-deep-earth"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Delivery
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                We offer several delivery options to suit your needs. Delivery
                times are estimates and may vary depending on your location and
                external factors.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                  <h3 className="font-semibold text-cocoa mb-2">
                    UK Standard Delivery
                  </h3>
                  <p className="text-sm">
                    <strong>Cost:</strong> Free on orders over £40, otherwise
                    £3.95
                    <br />
                    <strong>Timeframe:</strong> 3-5 business days
                  </p>
                </div>

                <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                  <h3 className="font-semibold text-cocoa mb-2">
                    UK Next-Day Delivery
                  </h3>
                  <p className="text-sm">
                    <strong>Cost:</strong> £5.95
                    <br />
                    <strong>Timeframe:</strong> Next business day (order before
                    2pm, Mon-Fri)
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  International Delivery
                </h3>
                <p className="text-sm">
                  We ship to the United States, UAE, European Union, and other
                  international destinations. Shipping costs are calculated at
                  checkout based on weight and destination. Delivery typically
                  takes 5-21 business days depending on your location. You are
                  responsible for any customs duties or import taxes that may
                  apply.
                </p>
              </div>

              <p className="text-sm">
                For full delivery details, including minimum order values for
                international shipping, please see our{' '}
                <a
                  href="/delivery-returns"
                  className="text-sage-green font-semibold hover:underline"
                >
                  Delivery & Returns
                </a>{' '}
                page.
              </p>
            </div>
          </section>

          {/* Returns */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faRotateLeft}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Returns & Refunds
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                We want you to be happy with every purchase. If something isn't
                right, you can return most items within <strong>30 days</strong>{' '}
                of delivery for a full refund.
              </p>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  Return Requirements
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>
                    Items must be unused, in their original condition, and in
                    original packaging where possible
                  </li>
                  <li>
                    Contact us at hello@auntiemarlenes.com to initiate a return
                  </li>
                  <li>
                    Return shipping costs are your responsibility unless the
                    item is faulty or we made an error
                  </li>
                  <li>
                    Refunds are processed within 5-7 business days of receiving
                    the returned item
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Hygiene Restrictions
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>
                    For hygiene reasons, we cannot accept returns on hair care
                    products that have been opened, unsealed, or partially used
                  </li>
                  <li>
                    Wigs that have been worn, styled, or had their tags removed
                    cannot be returned
                  </li>
                  <li>
                    These restrictions do not affect your statutory rights for
                    faulty or misdescribed products
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faShieldCheck}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Intellectual Property
              </h2>
            </div>

            <div className="text-gray-700 space-y-3">
              <p>
                All content on this website, including text, images, graphics,
                logos, icons, and software, is the property of Auntie Marlene's
                or its content suppliers and is protected by UK and
                international copyright laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative
                works from any content on this site without our express written
                permission. Using our content for commercial purposes without
                authorisation is strictly prohibited.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faScaleBalanced}
                className="text-terracotta"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Limitation of Liability
              </h2>
            </div>

            <div className="text-gray-700 space-y-3">
              <p>
                We work hard to provide a great shopping experience, but we
                can't guarantee that our website will always be available,
                error-free, or completely secure.
              </p>
              <p>
                To the fullest extent permitted by law, Auntie Marlene's is not
                liable for any indirect, incidental, or consequential damages
                arising from your use of our website or the purchase of our
                products. This includes, but is not limited to, loss of data,
                revenue, or profit.
              </p>
              <p>
                Nothing in these terms excludes or limits our liability for
                death or personal injury caused by our negligence, fraud, or any
                other liability that cannot be excluded by law.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faGavel}
                className="text-deep-earth"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Governing Law
              </h2>
            </div>

            <div className="text-gray-700 space-y-3">
              <p>
                These terms and conditions are governed by and construed in
                accordance with the laws of England and Wales. Any disputes
                relating to these terms will be subject to the exclusive
                jurisdiction of the courts of England and Wales.
              </p>
              <p>
                If you are a consumer, you will benefit from any mandatory
                provisions of the law of the country in which you are resident.
                Nothing in these terms affects your rights as a consumer to rely
                on such mandatory provisions of local law.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faPenToSquare}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Changes to These Terms
              </h2>
            </div>

            <div className="text-gray-700 space-y-3">
              <p>
                We may update these terms and conditions from time to time to
                reflect changes in our business practices, legal requirements,
                or for other reasons. When we make changes, we'll update the
                "Last updated" date at the top of this page.
              </p>
              <p>
                We encourage you to review these terms periodically. Your
                continued use of our website after changes are posted means you
                accept the updated terms.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Contact Us
              </h2>
            </div>

            <div className="text-gray-700 space-y-3">
              <p>
                If you have any questions about these terms and conditions,
                please get in touch. We're always happy to help.
              </p>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="mt-12 bg-sage-green/10 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-cocoa mb-2">Have Questions?</h3>
            <p className="text-gray-700 text-sm mb-4">
              If anything in these terms is unclear, our team is here to help.
            </p>
            <a
              href="mailto:hello@auntiemarlenes.com"
              className="inline-block px-6 py-3 bg-sage-green hover:bg-sage-green/90 text-white font-bold rounded-md transition-colors"
            >
              hello@auntiemarlenes.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

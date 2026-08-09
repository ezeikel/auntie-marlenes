import {
  faChild,
  faClock,
  faCookie,
  faDatabase,
  faEnvelope,
  faGlobe,
  faScaleBalanced,
  faShareNodes,
  faShieldCheck,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    "Learn how Auntie Marlene's collects, uses, and protects your personal data in line with UK GDPR.",
};

type PrivacyPolicyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-playfair font-bold text-cocoa mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

          <div className="text-gray-700 space-y-4 mb-12">
            <p>
              At Auntie Marlene&apos;s, we take your privacy seriously. This
              policy explains what personal data we collect, why we collect it,
              and what we do with it. We&apos;ve written it in plain English so
              you can actually understand it.
            </p>
            <p>
              We are the data controller for the personal data we collect
              through our website at{' '}
              <a
                href="https://www.auntiemarlenes.com"
                className="text-sage-green font-semibold hover:underline"
              >
                auntiemarlenes.com
              </a>
              . We are a UK-based e-commerce business selling hair and beauty
              products.
            </p>
          </div>

          {/* What Data We Collect */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faDatabase}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                What Data We Collect
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                We only collect data that we genuinely need to run our store and
                give you a good experience. Here&apos;s what we collect and
                when:
              </p>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  When You Create an Account
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Your name and email address</li>
                  <li>
                    Your Google profile information (if you sign in with Google)
                  </li>
                  <li>A profile photo (if provided by your Google account)</li>
                </ul>
              </div>

              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  When You Place an Order
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Your name, email, and phone number</li>
                  <li>Delivery and billing addresses</li>
                  <li>What you ordered and how much you paid</li>
                  <li>
                    Payment details (handled securely by Shopify Payments — we
                    never see or store your full card number)
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h3 className="font-semibold text-amber-900 mb-2">
                  When You Browse Our Site
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Pages you visit and products you view</li>
                  <li>Your device type, browser, and operating system</li>
                  <li>Your approximate location (country/region level)</li>
                  <li>How you found us (e.g. search engine, social media)</li>
                  <li>Technical data like your IP address</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  When You Sign Up for Emails
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Your email address</li>
                  <li>Your name (if provided)</li>
                  <li>
                    Whether you open our emails and click any links (so we can
                    send you more relevant content)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faShieldCheck}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                How We Use Your Data
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                We use your data for specific purposes, and we always have a
                legal basis for doing so under UK GDPR:
              </p>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  To Fulfil Our Contract With You
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Processing and delivering your orders</li>
                  <li>Sending order confirmations and shipping updates</li>
                  <li>Handling returns and refunds</li>
                  <li>Managing your account</li>
                </ul>
              </div>

              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  For Our Legitimate Interests
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>
                    Improving our website and understanding how people use it
                  </li>
                  <li>Detecting and preventing fraud</li>
                  <li>Fixing bugs and technical issues</li>
                  <li>Analysing sales trends to stock the right products</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h3 className="font-semibold text-amber-900 mb-3">
                  With Your Consent
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Sending you marketing emails and newsletters</li>
                  <li>Showing you personalised ads on social media</li>
                  <li>Setting non-essential cookies on your device</li>
                </ul>
                <p className="text-sm text-amber-800 mt-2">
                  You can withdraw your consent at any time — just unsubscribe
                  from our emails or update your cookie preferences.
                </p>
              </div>
            </div>
          </section>

          {/* Third Parties */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faShareNodes}
                className="text-deep-earth"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Who We Share Your Data With
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                We never sell your personal data. We only share it with trusted
                third parties who help us run our business:
              </p>

              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  Checkout and Payments
                </h3>
                <p className="text-sm mb-2">
                  <strong>Shopify</strong> — Our checkout is hosted by Shopify.
                  When you place an order, Shopify processes your payment
                  securely through Shopify Payments. They handle your card
                  details, billing address, and order information. Shopify is
                  PCI DSS compliant, meaning they meet the highest standards for
                  payment security.
                </p>
                <p className="text-sm">
                  <a
                    href="https://www.shopify.com/legal/privacy"
                    className="text-sage-green font-semibold hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read Shopify&apos;s privacy policy
                  </a>
                </p>
              </div>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  Analytics and Performance
                </h3>
                <ul className="text-sm space-y-3">
                  <li>
                    <strong>Plausible Analytics</strong> — A privacy-friendly
                    analytics tool that does not use cookies and does not track
                    you across websites. It gives us basic stats like page views
                    and referral sources without collecting personal data.
                  </li>
                  <li>
                    <strong>PostHog</strong> — Helps us understand how people
                    use our site so we can make it better. This includes things
                    like which pages you visit, what you click on, and where you
                    might get stuck.
                  </li>
                  <li>
                    <strong>Vercel Analytics</strong> — Monitors our
                    website&apos;s performance (page load speeds, errors) so we
                    can keep things running smoothly.
                  </li>
                  <li>
                    <strong>Sentry</strong> — Tracks technical errors on our
                    site. If something breaks, Sentry helps us find and fix it
                    quickly. It may collect limited technical data about your
                    device and browser when an error occurs.
                  </li>
                </ul>
              </div>

              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  Marketing and Advertising
                </h3>
                <ul className="text-sm space-y-3">
                  <li>
                    <strong>Meta Pixel (Facebook/Instagram)</strong> — With your
                    consent, we use the Meta Pixel to measure how effective our
                    ads are on Facebook and Instagram. This may track actions
                    you take on our site (like viewing a product or making a
                    purchase) and share that data with Meta for ad targeting.
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h3 className="font-semibold text-amber-900 mb-3">Email</h3>
                <ul className="text-sm text-amber-800 space-y-3">
                  <li>
                    <strong>Resend</strong> — We use Resend to send you
                    transactional emails (order confirmations, shipping updates,
                    password resets) and marketing newsletters if you&apos;ve
                    opted in. Resend processes your email address and name to
                    deliver these messages.
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  Authentication
                </h3>
                <p className="text-sm">
                  <strong>Google OAuth</strong> — If you choose to sign in with
                  Google, we receive your name, email address, and profile photo
                  from Google. We use this only to create and manage your
                  account. We also offer magic link sign-in via email as an
                  alternative.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faCookie}
                className="text-terracotta"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Cookies
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Cookies are small files stored on your device that help our
                website work properly and give us insights into how you use it.
              </p>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  Essential Cookies
                </h3>
                <p className="text-sm">
                  These are needed for the site to work — things like keeping
                  you logged in, remembering what&apos;s in your bag, and
                  processing your checkout. You can&apos;t opt out of these
                  because the site wouldn&apos;t function without them.
                </p>
              </div>

              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-2">
                  Analytics Cookies
                </h3>
                <p className="text-sm">
                  These help us understand how visitors interact with our
                  website. Note that Plausible Analytics does not use cookies at
                  all. PostHog and Vercel Analytics may set cookies to help us
                  measure site usage and performance.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Marketing Cookies
                </h3>
                <p className="text-sm text-amber-800">
                  The Meta Pixel sets cookies to track conversions from our
                  Facebook and Instagram ads. These are only set with your
                  consent.
                </p>
              </div>

              <p className="text-sm">
                You can manage your cookie preferences at any time through your
                browser settings. For more details about the specific cookies we
                use, please see our{' '}
                <a
                  href="/cookie-policy"
                  className="text-sage-green font-semibold hover:underline"
                >
                  Cookie Policy
                </a>
                .
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faScaleBalanced}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Your Rights Under UK GDPR
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Under UK data protection law, you have a number of rights over
                your personal data. These are free to exercise and we aim to
                respond within 30 days.
              </p>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <ul className="text-sm space-y-3">
                  <li>
                    <strong>Right of access</strong> — You can ask us for a copy
                    of all the personal data we hold about you.
                  </li>
                  <li>
                    <strong>Right to rectification</strong> — If any of your
                    data is wrong or incomplete, you can ask us to correct it.
                  </li>
                  <li>
                    <strong>Right to erasure</strong> — You can ask us to delete
                    your personal data. We&apos;ll do this unless we have a
                    legal reason to keep it (like tax records for completed
                    orders).
                  </li>
                  <li>
                    <strong>Right to restrict processing</strong> — You can ask
                    us to limit how we use your data in certain circumstances.
                  </li>
                  <li>
                    <strong>Right to data portability</strong> — You can ask us
                    to give you your data in a machine-readable format so you
                    can transfer it to another service.
                  </li>
                  <li>
                    <strong>Right to object</strong> — You can object to us
                    processing your data for direct marketing or where we rely
                    on legitimate interests.
                  </li>
                  <li>
                    <strong>Rights around automated decision-making</strong> —
                    We don&apos;t make any automated decisions that
                    significantly affect you, but you have the right not to be
                    subject to them.
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h3 className="font-semibold text-amber-900 mb-2">
                  How to Exercise Your Rights
                </h3>
                <p className="text-sm text-amber-800">
                  To make a request, email us at{' '}
                  <a
                    href="mailto:hello@auntiemarlenes.com"
                    className="font-semibold hover:underline"
                  >
                    hello@auntiemarlenes.com
                  </a>{' '}
                  with the subject line &quot;Data Rights Request&quot;. We may
                  need to verify your identity before processing your request.
                </p>
                <p className="text-sm text-amber-800 mt-2">
                  If you&apos;re not happy with how we handle your request, you
                  have the right to complain to the{' '}
                  <a
                    href="https://ico.org.uk/make-a-complaint/"
                    className="font-semibold hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Information Commissioner&apos;s Office (ICO)
                  </a>
                  , the UK&apos;s data protection authority.
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faClock}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Data Retention
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                We don&apos;t keep your data forever. Here&apos;s how long we
                hold onto different types of information:
              </p>

              <div className="bg-gray-50 rounded-lg p-5">
                <ul className="text-sm space-y-3">
                  <li>
                    <strong>Account data</strong> — Kept for as long as you have
                    an account with us. If you ask us to delete your account,
                    we&apos;ll remove your data within 30 days.
                  </li>
                  <li>
                    <strong>Order data</strong> — Kept for 7 years after your
                    last order, as required by UK tax law (HMRC requirements).
                  </li>
                  <li>
                    <strong>Marketing data</strong> — Kept until you
                    unsubscribe. Once you opt out, we&apos;ll remove you from
                    our mailing list within 7 days, though we may keep a record
                    of your email on a suppression list to make sure we
                    don&apos;t accidentally email you again.
                  </li>
                  <li>
                    <strong>Analytics data</strong> — Plausible does not store
                    any personal data. PostHog data is retained according to
                    their data retention policies. Sentry error logs are
                    typically retained for 90 days.
                  </li>
                  <li>
                    <strong>Cookie data</strong> — Varies by cookie. Session
                    cookies are deleted when you close your browser. Other
                    cookies have specific expiry dates, detailed in our Cookie
                    Policy.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* International Transfers */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faGlobe}
                className="text-deep-earth"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                International Data Transfers
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Some of the third-party services we use are based outside the
                UK. When your data is transferred internationally, we make sure
                it&apos;s protected:
              </p>

              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <ul className="text-sm space-y-3">
                  <li>
                    <strong>Shopify</strong> — Based in Canada, with servers
                    globally. Shopify complies with international data transfer
                    requirements and uses standard contractual clauses.
                  </li>
                  <li>
                    <strong>PostHog, Sentry, Vercel, Resend</strong> — These
                    services are based in the United States. Data transfers are
                    protected by the UK-US Data Bridge (an extension of the
                    EU-US Data Privacy Framework) and/or standard contractual
                    clauses approved by the ICO.
                  </li>
                  <li>
                    <strong>Meta</strong> — Based in the United States.
                    Transfers are covered by standard contractual clauses and
                    the UK-US Data Bridge.
                  </li>
                  <li>
                    <strong>Plausible</strong> — Based in the EU and processes
                    data within the EU/EEA, which has adequate data protection
                    standards recognised by the UK.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faChild}
                className="text-terracotta"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Children&apos;s Privacy
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <p className="text-sm text-amber-800">
                  Our website and services are not aimed at children under 16.
                  We do not knowingly collect personal data from anyone under 16
                  years of age. If you are a parent or guardian and believe your
                  child has given us personal data, please contact us at{' '}
                  <a
                    href="mailto:hello@auntiemarlenes.com"
                    className="font-semibold hover:underline"
                  >
                    hello@auntiemarlenes.com
                  </a>{' '}
                  and we will delete it promptly.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Us */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Contact Us
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                If you have any questions about this privacy policy, want to
                exercise your data rights, or just want to know more about how
                we handle your data, get in touch:
              </p>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <ul className="text-sm space-y-2">
                  <li>
                    <strong>Email:</strong>{' '}
                    <a
                      href="mailto:hello@auntiemarlenes.com"
                      className="text-sage-green font-semibold hover:underline"
                    >
                      hello@auntiemarlenes.com
                    </a>
                  </li>
                  <li>
                    <strong>Website:</strong>{' '}
                    <a
                      href="https://www.auntiemarlenes.com"
                      className="text-sage-green font-semibold hover:underline"
                    >
                      auntiemarlenes.com
                    </a>
                  </li>
                </ul>
              </div>

              <p className="text-sm">
                We aim to respond to all privacy-related enquiries within 7
                days. For data rights requests, we will respond within 30 days
                as required by UK GDPR.
              </p>
            </div>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-12">
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="font-semibold text-cocoa mb-2">
                Changes to This Policy
              </h3>
              <p className="text-sm text-gray-700">
                We may update this privacy policy from time to time to reflect
                changes in our practices or for legal reasons. When we make
                significant changes, we&apos;ll let you know by posting a notice
                on our website or sending you an email. We encourage you to
                check this page occasionally to stay informed.
              </p>
            </div>
          </section>

          {/* Need Help */}
          <section className="bg-sage-green/10 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-cocoa mb-2">
              Questions About Your Privacy?
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              We&apos;re here to help. If anything in this policy is unclear or
              you want to know more about how we handle your data, just ask.
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

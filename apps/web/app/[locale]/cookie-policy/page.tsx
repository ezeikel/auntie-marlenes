import { setRequestLocale } from 'next-intl/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCookieBite,
  faGear,
  faChartLine,
  faBug,
  faBullhorn,
  faSliders,
  faCircleExclamation,
} from '@fortawesome/pro-regular-svg-icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    "Learn about the cookies used on Auntie Marlene's website, including essential, analytics, and marketing cookies.",
};

type CookiePolicyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CookiePolicyPage({
  params,
}: CookiePolicyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-playfair font-bold text-cocoa mb-4">
            Cookie Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

          <div className="text-gray-700 space-y-3 mb-12">
            <p>
              Cookies are small text files that are placed on your device when
              you visit a website. They help websites work properly, remember
              your preferences, and give us insight into how our site is being
              used.
            </p>
            <p>
              This page explains what cookies we use, why we use them, and how
              you can manage them. We've kept it in plain English so it's easy
              to understand.
            </p>
          </div>

          {/* Essential Cookies */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faGear}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Essential Cookies
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                These cookies are necessary for the website to function. Without
                them, things like your shopping bag and account login wouldn't
                work. You can't disable these cookies because the site simply
                wouldn't function without them.
              </p>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  Shopify Cart & Session Cookies
                </h3>
                <p className="text-sm mb-2">
                  Our online shop is powered by Shopify. These cookies keep
                  track of items in your shopping bag, remember your checkout
                  progress, and maintain your browsing session as you move
                  around the site.
                </p>
                <div className="text-sm bg-white/60 rounded p-3 mt-2">
                  <p>
                    <strong>Provider:</strong> Shopify
                  </p>
                  <p>
                    <strong>Purpose:</strong> Shopping bag, checkout process,
                    session management
                  </p>
                  <p>
                    <strong>Duration:</strong> Session to 2 weeks
                  </p>
                </div>
              </div>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  Authentication Cookie
                </h3>
                <p className="text-sm mb-2">
                  If you create an account and sign in, we use a secure session
                  token to keep you logged in as you browse the site. This is
                  managed by NextAuth and is stored securely.
                </p>
                <div className="text-sm bg-white/60 rounded p-3 mt-2">
                  <p>
                    <strong>Provider:</strong> NextAuth
                  </p>
                  <p>
                    <strong>Purpose:</strong> Keeping you signed in to your
                    account
                  </p>
                  <p>
                    <strong>Duration:</strong> Session (expires when you close
                    your browser or sign out)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Analytics Cookies */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Analytics Cookies
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                These cookies help us understand how visitors use our website,
                so we can improve the experience. The data is aggregated and
                anonymised where possible.
              </p>

              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">PostHog</h3>
                <p className="text-sm mb-2">
                  PostHog helps us understand user behaviour on our site, such
                  as which pages are visited most, how users navigate through
                  the shop, and where people might be running into issues. This
                  helps us make improvements to your shopping experience.
                </p>
                <div className="text-sm bg-white/60 rounded p-3 mt-2">
                  <p>
                    <strong>Provider:</strong> PostHog
                  </p>
                  <p>
                    <strong>Purpose:</strong> User behaviour analytics, feature
                    usage tracking
                  </p>
                  <p>
                    <strong>Duration:</strong> Up to 1 year
                  </p>
                </div>
              </div>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  Plausible Analytics
                </h3>
                <p className="text-sm mb-2">
                  Plausible is a privacy-friendly analytics tool. It's worth
                  noting that Plausible does{' '}
                  <strong>not actually use cookies</strong>. It collects basic
                  visitor statistics (like page views and referral sources)
                  without tracking individual users or storing any data on your
                  device. We include it here for transparency.
                </p>
                <div className="text-sm bg-white/60 rounded p-3 mt-2">
                  <p>
                    <strong>Provider:</strong> Plausible
                  </p>
                  <p>
                    <strong>Purpose:</strong> Privacy-friendly page view and
                    referral analytics
                  </p>
                  <p>
                    <strong>Cookies:</strong> None (cookieless tracking)
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">
                  Vercel Analytics
                </h3>
                <p className="text-sm mb-2">
                  Vercel Analytics measures our website's performance, including
                  page load times and responsiveness. This helps us ensure the
                  site runs smoothly and quickly for all visitors.
                </p>
                <div className="text-sm bg-gray-50 rounded p-3 mt-2">
                  <p>
                    <strong>Provider:</strong> Vercel
                  </p>
                  <p>
                    <strong>Purpose:</strong> Website performance monitoring
                    (Core Web Vitals)
                  </p>
                  <p>
                    <strong>Duration:</strong> Session
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Error Tracking */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faBug}
                className="text-terracotta"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Error Tracking
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                Nobody likes a broken website. We use error tracking to catch
                and fix problems as quickly as possible.
              </p>

              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <h3 className="font-semibold text-cocoa mb-3">Sentry</h3>
                <p className="text-sm mb-2">
                  Sentry automatically detects errors and performance issues on
                  our website. When something goes wrong, Sentry captures
                  technical details (like the browser you're using, the page you
                  were on, and what happened) so our team can identify and fix
                  the issue. It does not track your personal browsing habits.
                </p>
                <div className="text-sm bg-white/60 rounded p-3 mt-2">
                  <p>
                    <strong>Provider:</strong> Sentry
                  </p>
                  <p>
                    <strong>Purpose:</strong> Error detection and performance
                    monitoring
                  </p>
                  <p>
                    <strong>Duration:</strong> Session
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Marketing Cookies */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faBullhorn}
                className="text-deep-earth"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Marketing Cookies
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                Marketing cookies help us show you relevant ads and measure how
                effective our advertising campaigns are.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h3 className="font-semibold text-amber-900 mb-3">
                  Meta Pixel (Facebook / Instagram)
                </h3>
                <p className="text-sm text-amber-800 mb-2">
                  The Meta Pixel helps us measure the effectiveness of our
                  Facebook and Instagram advertising. It allows us to understand
                  which ads lead to purchases, show you more relevant ads on
                  Facebook and Instagram, and build audiences for future
                  advertising campaigns. The pixel may track actions like
                  viewing a product, adding items to your bag, or completing a
                  purchase.
                </p>
                <div className="text-sm bg-white/60 rounded p-3 mt-2 text-amber-800">
                  <p>
                    <strong>Provider:</strong> Meta (Facebook)
                  </p>
                  <p>
                    <strong>Purpose:</strong> Ad measurement, retargeting,
                    audience building
                  </p>
                  <p>
                    <strong>Duration:</strong> Up to 90 days
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How to Manage Cookies */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faSliders}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                How to Manage Cookies
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                Most web browsers let you control cookies through their
                settings. You can choose to block or delete cookies at any time.
                Here's how to manage cookies in the most popular browsers:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-cocoa mb-2">
                    Google Chrome
                  </h3>
                  <p className="text-sm">
                    Settings &gt; Privacy and Security &gt; Cookies and other
                    site data
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-cocoa mb-2">
                    Mozilla Firefox
                  </h3>
                  <p className="text-sm">
                    Settings &gt; Privacy & Security &gt; Cookies and Site Data
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-cocoa mb-2">Safari</h3>
                  <p className="text-sm">
                    Preferences &gt; Privacy &gt; Manage Website Data
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-cocoa mb-2">
                    Microsoft Edge
                  </h3>
                  <p className="text-sm">
                    Settings &gt; Cookies and Site Permissions &gt; Manage and
                    delete cookies and site data
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What Happens If You Disable Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                What Happens If You Disable Cookies
              </h2>
            </div>

            <div className="text-gray-700 space-y-4">
              <p>
                You're free to disable cookies, but it may affect how our
                website works for you. Here's what to expect:
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Possible Effects
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>
                    Your shopping bag may not work properly, and items might not
                    be saved between pages
                  </li>
                  <li>You won't be able to stay signed in to your account</li>
                  <li>The checkout process may not function correctly</li>
                  <li>
                    We won't be able to remember your preferences (like language
                    or currency)
                  </li>
                  <li>
                    You may see less relevant ads on social media, though you'll
                    still see ads
                  </li>
                </ul>
              </div>

              <p>
                Disabling analytics and marketing cookies won't affect your
                ability to browse or shop on our site. These only impact our
                ability to measure performance and show you personalised
                advertising.
              </p>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="mt-12 bg-sage-green/10 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-cocoa mb-2">
              Questions About Cookies?
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              If you have any questions about how we use cookies, feel free to
              get in touch.
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

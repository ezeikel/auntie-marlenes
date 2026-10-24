import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import UnsubscribeForm from '@/components/UnsubscribeForm';
import { normaliseEmail, verifyUnsubscribeToken } from '@/lib/unsubscribe';

// A static segment, so it wins over the [category] catch-all at /unsubscribe.
export const metadata: Metadata = {
  title: 'Unsubscribe',
  description: "Stop marketing emails from Auntie Marlene's.",
  robots: { index: false, follow: false },
};

type UnsubscribePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ e?: string | string[]; t?: string | string[] }>;
};

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function UnsubscribePage({
  params,
  searchParams,
}: UnsubscribePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const email = first(query.e);
  const token = first(query.t);

  // Nothing changes on page load: the button posts the signed link back to a
  // server action, so mail scanners that open links do not unsubscribe anyone.
  const valid =
    Boolean(email && token) && (await verifyUnsubscribeToken(email, token));

  return (
    <div className="bg-warm-beige min-h-[70vh] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          {valid && email && token ? (
            <UnsubscribeForm email={normaliseEmail(email)} token={token} />
          ) : (
            <div>
              <h1 className="text-4xl font-playfair font-bold text-cocoa mb-4">
                Unsubscribe
              </h1>
              <p className="text-gray-600">
                This unsubscribe link is incomplete or has been changed. Please
                use the unsubscribe link in our most recent email, or email{' '}
                <a
                  href="mailto:hello@auntiemarlenes.com?subject=Unsubscribe"
                  className="text-terracotta underline"
                >
                  hello@auntiemarlenes.com
                </a>{' '}
                and we&apos;ll take you off the list.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

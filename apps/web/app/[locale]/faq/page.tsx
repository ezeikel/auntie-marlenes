import { faCircleQuestion } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    "Frequently asked questions about ordering, delivery, returns, products, and your account at Auntie Marlene's.",
};

const faqSections = [
  {
    title: 'Ordering & Payment',
    questions: [
      {
        q: 'How do I place an order?',
        a: 'Simply browse our shop, add items to your bag, and proceed to checkout. You can check out as a guest or create an account to track your orders and save your favourite products.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and Shop Pay through our secure Shopify checkout.',
      },
      {
        q: 'Will I receive an order confirmation?',
        a: 'Yes! You will receive an email confirmation with your order details immediately after placing your order. If you do not receive one within a few minutes, please check your spam folder or contact us.',
      },
      {
        q: 'Can I modify or cancel my order after placing it?',
        a: 'We process orders quickly, so please contact us as soon as possible at hello@auntiemarlenes.com if you need to make changes. We will do our best to accommodate your request before the order is dispatched.',
      },
    ],
  },
  {
    title: 'Delivery & Shipping',
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'UK standard delivery takes 3-5 business days. Next-day delivery is available for orders placed before 2pm (Monday-Friday) for £5.95. International delivery times vary by destination — typically 5-21 business days.',
      },
      {
        q: 'How can I track my order?',
        a: "Once your order has been dispatched, you will receive a tracking number via email. You can use this to follow your parcel's journey to your door.",
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes! We ship to the United States, United Arab Emirates, the European Union, and many other countries worldwide. Shipping costs are calculated at checkout based on weight and destination.',
      },
      {
        q: 'Is there free delivery?',
        a: 'Yes — we offer free standard delivery on all UK orders over £40. Orders under £40 have a flat delivery fee of £3.95.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 30 days of delivery. Items must be unused, in their original condition, and with all packaging intact. For hygiene reasons, we cannot accept returns on opened hair care products or wigs that have been worn.',
      },
      {
        q: 'How do I return an item?',
        a: 'Contact us at hello@auntiemarlenes.com to request a return. We will provide you with a returns label and instructions. Pack the item securely and send it back to us.',
      },
      {
        q: 'How long do refunds take?',
        a: 'Once we receive and inspect your return, refunds are processed within 5-7 business days. The refund will be issued to your original payment method.',
      },
      {
        q: 'What if my item arrives damaged?',
        a: 'If your item arrives damaged or faulty, please contact us immediately with photos. We will arrange a free return and send you a replacement or provide a full refund.',
      },
    ],
  },
  {
    title: 'Products & Hair Care',
    questions: [
      {
        q: 'Are all your products authentic?',
        a: 'Absolutely. We only stock 100% authentic, genuine products sourced directly from trusted suppliers and brands. We never sell counterfeit or imitation products.',
      },
      {
        q: "I'm not sure which products are right for my hair type. Can you help?",
        a: 'Of course! Visit our hair type guide to find tailored product recommendations for your hair type and texture.',
      },
      {
        q: 'How should I store my hair care products?',
        a: 'Store products in a cool, dry place away from direct sunlight. Keep lids tightly closed to preserve freshness. Most products have a shelf life of 12-24 months once opened.',
      },
    ],
  },
  {
    title: 'Account & Privacy',
    questions: [
      {
        q: 'Do I need an account to shop?',
        a: 'No — you can check out as a guest. However, creating an account lets you track orders, save your favourite products, and enjoy a faster checkout experience.',
      },
      {
        q: 'How is my personal data protected?',
        a: 'We take your privacy seriously. Your data is protected in accordance with UK GDPR regulations. For full details, please read our privacy policy.',
      },
      {
        q: 'How do I delete my account?',
        a: 'If you would like to delete your account and all associated data, please email us at hello@auntiemarlenes.com and we will process your request within 30 days in accordance with data protection regulations.',
      },
    ],
  },
];

type FAQPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon
              icon={faCircleQuestion}
              className="text-sage-green"
              size="2x"
            />
            <h1 className="text-4xl font-playfair font-bold text-cocoa">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-gray-600 mb-10">
            Find answers to our most commonly asked questions below. Can&apos;t
            find what you&apos;re looking for?{' '}
            <Link
              href="/contact"
              className="text-sage-green font-semibold hover:underline"
            >
              Get in touch
            </Link>{' '}
            and we&apos;ll be happy to help.
          </p>

          <div className="space-y-10">
            {faqSections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-playfair font-bold text-cocoa mb-4">
                  {section.title}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${section.title}-${index}`}
                    >
                      <AccordionTrigger className="text-left text-cocoa hover:no-underline hover:text-sage-green">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 leading-relaxed">
                        {item.q.includes('hair type') ? (
                          <>
                            Of course! Visit our{' '}
                            <Link
                              href="/hair-type"
                              className="text-sage-green font-semibold hover:underline"
                            >
                              hair type guide
                            </Link>{' '}
                            to find tailored product recommendations for your
                            hair type and texture.
                          </>
                        ) : item.q.includes('personal data') ? (
                          <>
                            We take your privacy seriously. Your data is
                            protected in accordance with UK GDPR regulations.
                            For full details, please read our{' '}
                            <Link
                              href="/privacy"
                              className="text-sage-green font-semibold hover:underline"
                            >
                              privacy policy
                            </Link>
                            .
                          </>
                        ) : (
                          item.a
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>

          {/* Contact CTA */}
          <section className="mt-12 bg-sage-green/10 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-cocoa mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Our customer service team is happy to help with anything not
              covered here.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-sage-green hover:bg-sage-green/90 text-white font-bold rounded-md transition-colors"
            >
              Contact Us
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

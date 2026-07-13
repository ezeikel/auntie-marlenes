import {
  faFilterList,
  faFlaskVial,
  faHandHoldingHeart,
  faLeaf,
  faMagnifyingGlass,
  faShieldCheck,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Our Curation Process | How We Choose Our Products',
  description:
    "We don't stock 80,000 products. We hand-pick every single item on our shelves. Learn how Auntie Marlene's curates the best products for textured hair and melanin-rich skin.",
  path: '/our-curation',
  keywords: [
    'curated black beauty products',
    'hand-picked hair care',
    'trusted beauty supply',
    'vetted products textured hair',
  ],
});

type OurCurationPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OurCurationPage({
  params,
}: OurCurationPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <p className="text-sm font-inter font-semibold text-sage-green uppercase tracking-wider mb-3">
              Our Approach
            </p>
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-cocoa mb-4">
              Curated, Not Catalogued
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Some stores stock 80,000 products. We stock the ones that actually
              work. Every item on our shelves has been tried, tested, and chosen
              with intention.
            </p>
          </div>

          {/* Why We Curate */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faFilterList}
                className="text-terracotta"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Why We Curate
              </h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                If you&apos;ve ever walked into a beauty supply store and felt
                overwhelmed by a thousand options with no guidance — that&apos;s
                exactly what we&apos;re here to fix.
              </p>
              <p>
                We believe you shouldn&apos;t have to guess which products will
                work for your hair. You shouldn&apos;t have to waste money
                trying things that aren&apos;t right for you. And you definitely
                shouldn&apos;t have to settle for products that weren&apos;t
                made with textured hair in mind.
              </p>
              <p>
                So instead of stocking everything, we stock the{' '}
                <strong>right things</strong>. Fewer products, better results.
              </p>
            </div>
          </section>

          {/* Our Process */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Our Process
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={faFlaskVial}
                    className="text-terracotta"
                  />
                  <h3 className="font-semibold text-cocoa">We Test It</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Every product gets tested on real textured hair — our own
                  hair, our families&apos; hair, our community&apos;s hair. If
                  it doesn&apos;t deliver results, it doesn&apos;t make the cut.
                </p>
              </div>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faLeaf} className="text-sage-green" />
                  <h3 className="font-semibold text-cocoa">
                    We Check the Ingredients
                  </h3>
                </div>
                <p className="text-sm text-gray-700">
                  We read every label. We look for nourishing ingredients that
                  work with textured hair, not against it. No harmful chemicals,
                  no empty promises.
                </p>
              </div>

              <div className="bg-warm-clay/5 border border-warm-clay/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={faHandHoldingHeart}
                    className="text-warm-clay"
                  />
                  <h3 className="font-semibold text-cocoa">
                    We Consider the Brand
                  </h3>
                </div>
                <p className="text-sm text-gray-700">
                  We prioritise brands that understand our community — brands
                  that are Black-owned, ethically sourced, or have a genuine
                  track record with textured hair care.
                </p>
              </div>

              <div className="bg-deep-earth/5 border border-deep-earth/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={faShieldCheck}
                    className="text-deep-earth"
                  />
                  <h3 className="font-semibold text-cocoa">
                    We Stand Behind It
                  </h3>
                </div>
                <p className="text-sm text-gray-700">
                  If it&apos;s on our site, it means we&apos;d use it ourselves.
                  We don&apos;t stock products for commission — we stock them
                  because they work.
                </p>
              </div>
            </div>
          </section>

          {/* The Numbers */}
          <section className="mb-12">
            <div className="bg-cocoa text-white rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-playfair font-bold mb-6">
                Quality Over Quantity
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl md:text-4xl font-playfair font-bold text-warm-sand">
                    58
                  </p>
                  <p className="text-sm text-white/70 mt-1">
                    Hand-picked products
                  </p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-playfair font-bold text-warm-sand">
                    100%
                  </p>
                  <p className="text-sm text-white/70 mt-1">Tested by us</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-playfair font-bold text-warm-sand">
                    0
                  </p>
                  <p className="text-sm text-white/70 mt-1">Filler products</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <p className="text-gray-600 mb-6">
              Ready to try products that were chosen with your hair in mind?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-block px-8 py-3 bg-sage-green hover:bg-sage-green/90 text-white font-bold rounded-md transition-colors"
              >
                Shop Our Collection
              </Link>
              <Link
                href="/hair-type"
                className="inline-block px-8 py-3 border-2 border-cocoa text-cocoa hover:bg-cocoa hover:text-white font-bold rounded-md transition-colors"
              >
                Find Your Hair Type
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

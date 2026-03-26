import { setRequestLocale } from 'next-intl/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faClock,
  faCommentDots,
} from '@fortawesome/pro-regular-svg-icons';
import {
  faInstagram,
  faTiktok,
  faFacebook,
  faYoutube,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';
import type { Metadata } from 'next';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { socialLinks } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    "Get in touch with Auntie Marlene's. Reach us via email, WhatsApp, or social media. We typically respond within 24 hours.",
};

const iconMap: Record<string, IconDefinition> = {
  instagram: faInstagram,
  tiktok: faTiktok,
  facebook: faFacebook,
  youtube: faYoutube,
  whatsapp: faWhatsapp,
};

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-playfair font-bold text-cocoa mb-4">
            Contact Us
          </h1>
          <p className="text-gray-600 mb-10">
            We&apos;d love to hear from you. Whether you have a question about
            our products, your order, or anything else, our team is here to
            help.
          </p>

          {/* Email */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Email
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Send us an email and we&apos;ll get back to you as soon as
              possible.
            </p>
            <a
              href="mailto:hello@auntiemarlenes.com"
              className="inline-block px-6 py-3 bg-sage-green hover:bg-sage-green/90 text-white font-bold rounded-md transition-colors"
            >
              hello@auntiemarlenes.com
            </a>
          </section>

          {/* WhatsApp */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faWhatsapp}
                className="text-[#25D366]"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                WhatsApp
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Prefer to chat? Send us a message on WhatsApp for a quick
              response.
            </p>
            <a
              href="https://wa.me/447932442879"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold rounded-md transition-colors"
            >
              Message us on WhatsApp
            </a>
          </section>

          {/* Social Media */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faCommentDots}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Follow Us
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Stay connected and follow us on social media for the latest
              updates, tips, and offers.
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-lg hover:border-sage-green hover:bg-sage-green/5 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={iconMap[link.icon]}
                    className="text-cocoa"
                    size="lg"
                  />
                  <span className="font-medium text-cocoa">{link.name}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Response Time & Hours */}
          <section className="bg-sage-green/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faClock}
                className="text-deep-earth"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Response Times
              </h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>We typically respond within 24 hours.</strong>
              </p>
              <p>
                <strong>Business hours:</strong> Monday&ndash;Friday,
                9am&ndash;5pm GMT
              </p>
              <p className="text-sm text-gray-500">
                Messages received outside business hours will be answered on the
                next working day.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

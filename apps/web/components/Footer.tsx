import {
  faFacebook,
  faInstagram,
  faTiktok,
  faWhatsapp,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { socialLinks } from '@/lib/constants';
import NewsletterForm from './NewsletterForm';

const iconMap = {
  whatsapp: faWhatsapp,
  tiktok: faTiktok,
  instagram: faInstagram,
  facebook: faFacebook,
  youtube: faYoutube,
};

async function CachedCopyright() {
  'use cache';
  cacheLife('max'); // Cache for 30 days, revalidate monthly (ideal for annual data)
  cacheTag('footer'); // Tag for webhook invalidation

  const year = new Date().getFullYear();

  return (
    <p className="text-center md:text-left text-white/80">
      &copy; {year} Auntie Marlene's. All rights reserved.
    </p>
  );
}

const Footer = () => {
  return (
    <footer className="bg-deep-earth text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Information Column */}
          <div>
            <h3 className="text-lg font-playfair font-bold mb-4 border-b border-white/20 pb-2">
              Information
            </h3>
            <ul className="space-y-3 font-inter">
              <li>
                <Link
                  href="/about"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery-returns"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  Deliveries & Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-lg font-playfair font-bold mb-4 border-b border-white/20 pb-2">
              Support
            </h3>
            <ul className="space-y-3 font-inter">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us Column */}
          <div>
            <h3 className="text-lg font-playfair font-bold mb-4 border-b border-white/20 pb-2">
              Connect With Us
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-inter mb-3">
                  Follow Auntie Marlene's
                </p>
                <div className="flex space-x-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      aria-label={link.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-warm-clay transition-colors text-xl w-11 h-11 flex items-center justify-center rounded-full border border-white/20 hover:border-warm-clay"
                    >
                      <FontAwesomeIcon icon={iconMap[link.icon]} />
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-inter mb-2">Customer Support</p>
                <a
                  href="mailto:hello@auntiemarlenes.com"
                  className="text-sm hover:text-warm-clay transition-colors block"
                >
                  hello@auntiemarlenes.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-xl font-playfair font-bold mb-2">
              Be the First to Know
            </h3>
            <p className="text-sm text-white/80 mb-4">
              Subscribe to our newsletter so we can keep you up to date with the
              latest offers, discounts and news.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-inter">
            <CachedCopyright />
            <p className="text-center text-white/80">
              Made with{' '}
              <span className="text-terracotta font-bold text-lg">♡</span> in{' '}
              <span className="text-white font-bold">South London</span> for
              beautiful skin &amp; hair
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

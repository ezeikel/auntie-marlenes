import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram,
  faTiktok,
  faFacebook,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { faArrowRight } from '@fortawesome/pro-regular-svg-icons';
import { connection } from 'next/server';

const Footer = async () => {
  await connection();

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
                  href="/track-order"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  Track Your Order
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
                  href="/size-guide"
                  className="hover:text-warm-clay transition-colors text-sm"
                >
                  Size Guide
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
                  <a
                    href="#"
                    aria-label="TikTok"
                    className="hover:text-warm-clay transition-colors text-xl w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:border-warm-clay"
                  >
                    <FontAwesomeIcon icon={faTiktok} />
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="hover:text-warm-clay transition-colors text-xl w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:border-warm-clay"
                  >
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="hover:text-warm-clay transition-colors text-xl w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:border-warm-clay"
                  >
                    <FontAwesomeIcon icon={faFacebook} />
                  </a>
                  <a
                    href="#"
                    aria-label="YouTube"
                    className="hover:text-warm-clay transition-colors text-xl w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:border-warm-clay"
                  >
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
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
            <form className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-warm-clay focus:border-warm-clay pr-12 h-12"
                  required
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1 bg-terracotta hover:bg-terracotta/90 text-white h-10 w-10 rounded-md"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                  <span className="sr-only">Subscribe</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-inter">
            <p className="text-center md:text-left text-white/80">
              &copy; {new Date().getFullYear()} Auntie Marlene's. All rights
              reserved.
            </p>
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

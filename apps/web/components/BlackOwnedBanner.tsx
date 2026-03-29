import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandHoldingHeart } from '@fortawesome/pro-regular-svg-icons';

export default function BlackOwnedBanner() {
  return (
    <section className="bg-cocoa text-white py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left">
          <FontAwesomeIcon
            icon={faHandHoldingHeart}
            className="text-warm-sand text-xl"
          />
          <p className="text-sm sm:text-base">
            <span className="font-bold">Proudly Black-Owned & Family-Run</span>{' '}
            from South London. Every product hand-picked and tested by us.{' '}
            <Link
              href="/about"
              className="underline hover:no-underline text-warm-sand"
            >
              Our story
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

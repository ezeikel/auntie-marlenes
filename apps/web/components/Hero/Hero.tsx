import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-warm-beige via-warm-sand to-sage-green py-20 md:py-32">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-block">
            <span className="inline-flex items-center rounded-full bg-cocoa/10 px-4 py-1.5 text-sm font-medium text-cocoa">
              New Arrivals Every Week
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold text-cocoa leading-tight">
            Embrace Your Natural Beauty
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-cocoa/80 max-w-2xl mx-auto">
            Premium afro hair and beauty products curated for your unique
            texture and style. Shop our collection of natural, organic products.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-base">
              <Link href="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-cocoa/60">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Free Shipping Over $50</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Natural & Organic</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

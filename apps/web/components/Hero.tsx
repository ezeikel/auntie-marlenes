'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faAward, faHeart } from '@fortawesome/pro-regular-svg-icons';

const Hero = () => {
  return (
    <section className="relative w-full min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Video Background for Desktop */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/pexels-kampus-6948104.jpg"
        >
          <source
            src="/videos/6940141-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
          {/* Fallback to image if video doesn't load */}
        </video>

        {/* Fallback background image for browsers that don't support video */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/images/pexels-kampus-6948104.jpg')",
            opacity: 0,
          }}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa/95 via-cocoa/75 to-cocoa/40 md:from-cocoa/90 md:via-cocoa/60 md:to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          {/* Eyebrow text */}
          <p className="text-warm-clay font-inter font-semibold text-sm md:text-base uppercase tracking-wider mb-4 animate-fade-in">
            Trusted by 50,000+ Families
          </p>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-white leading-tight mb-6 animate-slide-up">
            Where Beautiful Skin
            <br />
            <span className="text-warm-sand">Meets Gorgeous Hair</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-warm-beige font-inter mb-8 max-w-xl leading-relaxed animate-slide-up-delay">
            Discover premium skincare and haircare crafted for melanin-rich skin
            and textured hair. Because you deserve products that truly
            understand you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up-delay-2">
            <Button
              asChild
              size="lg"
              className="bg-terracotta hover:bg-terracotta/90 text-white font-bold text-base md:text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/shop">Shop All Products</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-cocoa font-bold text-base md:text-lg px-8 py-6 rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300"
            >
              <Link href="/hair-type">Find Your Hair Type</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6 md:gap-8 text-white/90 animate-fade-in-delay">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faStar}
                className="text-warm-sand"
                size="lg"
              />
              <span className="text-sm md:text-base font-inter">
                5-Star Rated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faAward}
                className="text-warm-sand"
                size="lg"
              />
              <span className="text-sm md:text-base font-inter">
                Expert Curated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faHeart}
                className="text-warm-sand"
                size="lg"
              />
              <span className="text-sm md:text-base font-inter">
                Family-Run
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Optional */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-scroll" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(8px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.6s both;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.4s both;
        }

        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.6s both;
        }

        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;

'use client';

import { faAward, faHeart, faStar } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

// Six hero scenes cycling as cross-faded background. Videos on desktop,
// static stills on mobile/tablet. Pattern mirrors parkingticketpal.com.
const HERO_VIDEOS = [
  '/videos/hero/hero-01-bonnet.mp4',
  '/videos/hero/hero-02-mother-daughter.mp4',
  '/videos/hero/hero-03-kitchen-beautician.mp4',
  '/videos/hero/hero-04-locs-oil.mp4',
  '/videos/hero/hero-05-barbershop-fade.mp4',
  '/videos/hero/hero-06-dad-braids.mp4',
];

const HERO_IMAGES = [
  '/images/hero/hero-01-bonnet.png',
  '/images/hero/hero-02-mother-daughter.png',
  '/images/hero/hero-03-kitchen-beautician.png',
  '/images/hero/hero-04-locs-oil.png',
  '/images/hero/hero-05-barbershop-fade.png',
  '/images/hero/hero-06-dad-braids.png',
];

const HERO_ALT_TEXT = [
  'A Black woman tying a satin bonnet at her bedroom mirror in warm lamplight',
  "A Black mother cornrowing her young daughter's hair in golden afternoon light",
  'Two Black women in a kitchen, one braiding the other’s hair',
  'A Black woman with locs anointing her hair with oil at a bathroom vanity',
  'A Black master barber shaping a young client’s fade in a classic barbershop',
  "A Black father carefully parting his young daughter's hair on a Saturday morning",
];

const IMAGE_INTERVAL = 6000; // ms between mobile image crossfades
const FADE_DURATION = 1500; // ms crossfade duration (desktop videos + mobile images)

const Hero = () => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Desktop: advance to the next video when the current one ends. The next
  // video was background-prefetched while the current one was playing (see
  // effect below), so .play() should start immediately without stutter.
  const handleVideoEnded = (index: number) => {
    if (index !== activeVideoIndex) return;
    const nextIndex = (index + 1) % HERO_VIDEOS.length;
    const nextVideo = videoRefs.current[nextIndex];
    if (nextVideo) {
      nextVideo.currentTime = 0;
      nextVideo.play().catch(() => {});
    }
    setActiveVideoIndex(nextIndex);
  };

  // Desktop: start video 0 playing on mount. Scenes 2-6 use preload="metadata"
  // so they don't eat mobile bandwidth on first paint.
  useEffect(() => {
    const firstVideo = videoRefs.current[0];
    if (firstVideo) {
      firstVideo.play().catch(() => {});
    }
  }, []);

  // Desktop: whenever the active video changes, trigger a full prefetch of the
  // NEXT video in the cycle so it's buffered and ready to play by the time the
  // current one fires onEnded (~5 seconds later). Uses the video element's
  // .load() method which respects the current preload attribute value — we
  // temporarily bump it to "auto" to force a full byte prefetch just for this
  // specific element, then let it play. This is the key optimization that
  // keeps initial page weight at ~1.4 MB while still giving seamless handoffs.
  useEffect(() => {
    const nextIndex = (activeVideoIndex + 1) % HERO_VIDEOS.length;
    const nextVideo = videoRefs.current[nextIndex];
    if (nextVideo && nextVideo.preload !== 'auto') {
      nextVideo.preload = 'auto';
      nextVideo.load();
    }
  }, [activeVideoIndex]);

  // Mobile: advance the image crossfade on an interval (no "ended" event for stills)
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, IMAGE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0 bg-cocoa">
        {/* Desktop: cycling cross-faded videos */}
        <div className="absolute inset-0 hidden lg:block">
          {HERO_VIDEOS.map((src, index) => (
            <video
              key={src}
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
              style={{
                transitionDuration: `${FADE_DURATION}ms`,
                opacity: index === activeVideoIndex ? 1 : 0,
                zIndex: index === activeVideoIndex ? 1 : 0,
              }}
              muted
              playsInline
              // Eager-load only the first scene so the homepage paints fast.
              // Scenes 2–6 fetch metadata only; their full byte payload is
              // pulled in by the onEnded handler when it seeks + plays them,
              // which gives the browser ~20s to background-fetch each before
              // it's needed. Drops initial page weight from ~13 MB to ~1.4 MB.
              preload={index === 0 ? 'auto' : 'metadata'}
              onEnded={() => handleVideoEnded(index)}
              aria-label={HERO_ALT_TEXT[index]}
            >
              <source src={src} type="video/mp4" />
            </video>
          ))}
        </div>

        {/* Mobile / tablet: cycling cross-faded still images */}
        <div className="absolute inset-0 lg:hidden">
          {HERO_IMAGES.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={HERO_ALT_TEXT[index]}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover transition-opacity ease-in-out"
              style={{
                transitionDuration: `${FADE_DURATION}ms`,
                opacity: index === currentImageIndex ? 1 : 0,
              }}
            />
          ))}
        </div>

        {/* Gradient overlay for text readability — matches existing AM palette */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-cocoa/95 via-cocoa/75 to-cocoa/40 md:from-cocoa/90 md:via-cocoa/60 md:to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <p className="mb-4 font-inter text-sm font-semibold uppercase tracking-wider text-warm-clay hero-animate-fade-in md:text-base">
            Black-Owned & Family-Run
          </p>

          {/* Main heading */}
          <h1 className="mb-6 font-playfair text-4xl font-bold leading-tight text-white hero-animate-slide-up sm:text-5xl md:text-6xl lg:text-7xl">
            Where Beautiful Skin
            <br />
            <span className="text-warm-sand">Meets Gorgeous Hair</span>
          </h1>

          {/* Subheading */}
          <p className="mb-8 max-w-xl font-inter text-lg leading-relaxed text-warm-beige hero-animate-slide-up-delay md:text-xl lg:text-2xl">
            Handpicked hair care, skincare, and beauty essentials for textured
            hair and melanin-rich skin. Curated with the same care your auntie
            would give.
          </p>

          {/* CTA buttons */}
          <div className="mb-12 flex flex-col gap-4 hero-animate-slide-up-delay-2 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-terracotta px-8 py-6 text-base font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-terracotta/90 hover:shadow-2xl md:text-lg"
            >
              <Link href="/shop">Shop All Products</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-white bg-white/10 px-8 py-6 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-cocoa md:text-lg"
            >
              <Link href="/hair-type">Find Your Hair Type</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 text-white/90 hero-animate-fade-in-delay md:gap-8">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faStar}
                className="text-warm-sand"
                size="lg"
              />
              <span className="font-inter text-sm md:text-base">
                Premium Brands
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faAward}
                className="text-warm-sand"
                size="lg"
              />
              <span className="font-inter text-sm md:text-base">
                Expert Curated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faHeart}
                className="text-warm-sand"
                size="lg"
              />
              <span className="font-inter text-sm md:text-base">
                Family-Run
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 animate-bounce md:block">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/50 p-2">
          <div className="h-3 w-1.5 hero-animate-scroll rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

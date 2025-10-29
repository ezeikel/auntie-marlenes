'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVolumeUp,
  faVolumeMute,
  faPlus,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/pro-solid-svg-icons';
import { socialMediaVideos } from '@/lib/social-media-data';
import { formatCurrency } from '@/lib/currency';

const SocialMediaShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(2); // Start with middle video active
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-play active video
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === activeIndex) {
          video.play().catch(() => {
            // Autoplay might be blocked, that's okay
          });
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [activeIndex]);

  const handleVideoClick = (index: number) => {
    setActiveIndex(index);
  };

  const handlePrevious = () => {
    setActiveIndex((prev) =>
      prev > 0 ? prev - 1 : socialMediaVideos.length - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev < socialMediaVideos.length - 1 ? prev + 1 : 0,
    );
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = !isMuted;
      }
    });
  };

  return (
    <section className="py-16 bg-warm-beige overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-cocoa mb-4">
            See It In Action
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Real results from our community. Watch how Auntie Marlene's
            transforms hair and skin care routines.
          </p>
        </div>

        {/* Video Carousel */}
        <div className="relative" ref={containerRef}>
          {/* Navigation Buttons */}
          <Button
            onClick={handlePrevious}
            size="icon"
            variant="ghost"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg hidden md:flex"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-cocoa" />
          </Button>

          <Button
            onClick={handleNext}
            size="icon"
            variant="ghost"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg hidden md:flex"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-cocoa" />
          </Button>

          {/* Videos Container */}
          <div className="flex items-center justify-center gap-4 px-4 md:px-16">
            {socialMediaVideos.map((video, index) => {
              const isActive = index === activeIndex;
              const offset = index - activeIndex;

              return (
                <div
                  key={video.id}
                  className={`relative transition-all duration-500 ease-out cursor-pointer ${
                    isActive
                      ? 'w-[280px] md:w-[320px] h-[500px] md:h-[580px] z-20 scale-100 opacity-100'
                      : Math.abs(offset) === 1
                        ? 'w-[200px] md:w-[240px] h-[360px] md:h-[420px] z-10 scale-90 opacity-60'
                        : 'w-[160px] md:w-[180px] h-[280px] md:h-[320px] z-0 scale-75 opacity-30 hidden lg:block'
                  } ${Math.abs(offset) > 2 ? 'hidden' : ''}`}
                  onClick={() => handleVideoClick(index)}
                  style={{
                    transform: `translateX(${offset * 20}px)`,
                  }}
                >
                  {/* Video Container */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
                    {/* Video Element */}
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      className="w-full h-full object-cover"
                      loop
                      muted={isMuted}
                      playsInline
                      poster={video.thumbnailUrl}
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                    </video>

                    {/* Overlay Content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Caption */}
                    <div className="absolute bottom-20 left-4 right-4 text-white pointer-events-none">
                      <p className="text-sm md:text-base font-medium mb-1">
                        {video.caption}
                      </p>
                      <p className="text-xs text-white/80">{video.author}</p>
                    </div>

                    {/* Mute Button - Only on active video */}
                    {isActive && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        size="icon"
                        variant="ghost"
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/60 text-white hover:text-white z-30"
                      >
                        <FontAwesomeIcon
                          icon={isMuted ? faVolumeMute : faVolumeUp}
                        />
                      </Button>
                    )}

                    {/* Product Info - Only on active video */}
                    {isActive && video.productName && (
                      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-cocoa truncate">
                              {video.productName}
                            </p>
                            {video.productPrice && (
                              <p className="text-sm font-bold text-sage-green">
                                {formatCurrency(video.productPrice, 'GBP')}
                              </p>
                            )}
                          </div>
                          {video.productLink && (
                            <Button
                              asChild
                              size="icon"
                              className="h-10 w-10 rounded-full bg-sage-green hover:bg-sage-green/90 text-white flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link href={video.productLink}>
                                <FontAwesomeIcon icon={faPlus} />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8 md:hidden">
            {socialMediaVideos.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? 'w-8 bg-sage-green'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-700 mb-4">
            Share your hair and skin journey with us
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-transparent border-2 border-cocoa text-cocoa hover:bg-cocoa hover:text-white font-bold"
          >
            <Link
              href="https://www.tiktok.com/@auntiemarlenes"
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow @auntiemarlenes
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaShowcase;

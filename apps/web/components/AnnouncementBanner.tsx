'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { Button } from '@/components/ui/button';

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-deep-earth text-white relative">
      <div className="container mx-auto px-4 py-2.5 text-center text-sm font-inter">
        <p>
          🎉 <strong>Free Delivery</strong> on all UK orders over{' '}
          <strong>£40</strong> | <strong>20% Off</strong> your first order with
          code: <strong>WELCOME20</strong>
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-white hover:bg-white/20"
        onClick={() => setIsVisible(false)}
        aria-label="Close announcement"
      >
        <FontAwesomeIcon icon={faTimes} size="sm" />
      </Button>
    </div>
  );
};

export default AnnouncementBanner;

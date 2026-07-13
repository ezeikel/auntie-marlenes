'use client';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ukShipping } from '@/config/shipping';
import { useLocation } from '@/contexts/LocationContext';
import { formatCurrency } from '@/lib/currency';

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('common.announcement');
  const { country, isLoading } = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or during initial client hydration
  if (!mounted || !isVisible) return null;

  // Show loading state or default message during initial load
  if (isLoading) {
    return (
      <div className="bg-deep-earth text-white relative">
        <div className="container mx-auto px-4 py-2.5 text-center text-sm font-inter">
          <p>
            🎉 <strong>{t('discount')}</strong> {t('firstOrder')}{' '}
            {t('withCode')}: <strong>{t('welcomeCode')}</strong>
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-white hover:bg-white/20"
          onClick={() => setIsVisible(false)}
          aria-label={t('closeAnnouncement')}
        >
          <FontAwesomeIcon icon={faTimes} size="sm" />
        </Button>
      </div>
    );
  }

  // Dynamic messaging based on location
  const getMessage = () => {
    switch (country.zone) {
      case 'UK':
        return (
          <>
            🎉 <strong>{t('freeDelivery')}</strong> {t('onOrdersOver')}{' '}
            <strong>
              {formatCurrency(ukShipping.freeDeliveryThreshold, 'GBP')}
            </strong>{' '}
            | <strong>{t('nextDayAvailable')}</strong> |{' '}
            <strong>{t('discount')}</strong> {t('firstOrder')}:{' '}
            <strong>{t('welcomeCode')}</strong>
          </>
        );
      case 'US':
        return (
          <>
            🎉 <strong>{t('weShipTo', { zone: 'the USA' })}</strong>{' '}
            {t('getProducts')} | <strong>{t('discount')}</strong>{' '}
            {t('firstOrder')}: <strong>{t('welcomeCode')}</strong>
          </>
        );
      case 'UAE':
        return (
          <>
            🎉 <strong>{t('weShipTo', { zone: 'the UAE' })}</strong>{' '}
            {t('getProducts')} | <strong>{t('discount')}</strong>{' '}
            {t('firstOrder')}: <strong>{t('welcomeCode')}</strong>
          </>
        );
      case 'EU':
        return (
          <>
            🎉 <strong>{t('weShipToEurope')}</strong> |{' '}
            <strong>{t('discount')}</strong> {t('firstOrder')}:{' '}
            <strong>{t('welcomeCode')}</strong>
          </>
        );
      default:
        return (
          <>
            🎉 <strong>{t('worldwideShipping')}</strong> |{' '}
            <strong>{t('discount')}</strong> {t('firstOrder')}:{' '}
            <strong>{t('welcomeCode')}</strong>
          </>
        );
    }
  };

  return (
    <div className="bg-deep-earth text-white relative">
      <div className="container mx-auto px-4 py-2.5 text-center text-sm font-inter">
        <p>{getMessage()}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-white hover:bg-white/20"
        onClick={() => setIsVisible(false)}
        aria-label={t('closeAnnouncement')}
      >
        <FontAwesomeIcon icon={faTimes} size="sm" />
      </Button>
    </div>
  );
};

export default AnnouncementBanner;

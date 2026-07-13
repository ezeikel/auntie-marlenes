'use client';

import { faChevronDown, faLanguage } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocale } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TRACKING_EVENTS } from '@/constants/events';
import { type Locale, localeNames, locales } from '@/i18n/config';
import { usePathname, useRouter } from '@/i18n/navigation';
import { logger } from '@/lib/logger';
import { useAnalytics } from '@/utils/analytics-client';

const LanguageSwitcher = () => {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const { track } = useAnalytics();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    const previousLocale = locale;

    // Track language change
    track(TRACKING_EVENTS.LANGUAGE_CHANGED, {
      previous_language: previousLocale,
      new_language: newLocale,
      previous_language_name: localeNames[previousLocale].name,
      new_language_name: localeNames[newLocale].name,
    });

    logger.info('Language changed', {
      previousLanguage: previousLocale,
      newLanguage: newLocale,
    });

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  const currentLocale = localeNames[locale];

  // Show loading state during SSR and initial client render to prevent hydration mismatch
  if (!isMounted) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between text-sm font-inter h-10 px-3 bg-transparent"
        disabled
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faLanguage} className="text-gray-600" />
          <span className="truncate">Loading...</span>
        </div>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-sm font-inter h-10 px-3 bg-transparent"
          disabled={isPending}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg shrink-0">{currentLocale.flag}</span>
            <span className="truncate hidden lg:inline">
              {currentLocale.name}
            </span>
            <span className="truncate lg:hidden">{locale.toUpperCase()}</span>
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="text-xs ml-2 shrink-0"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-semibold">
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((localeCode) => {
          const language = localeNames[localeCode];
          return (
            <DropdownMenuItem
              key={localeCode}
              onClick={() => handleLanguageChange(localeCode)}
              className="cursor-pointer flex items-center gap-3 py-2.5 px-3"
              disabled={isPending}
            >
              <span className="text-xl">{language.flag}</span>
              <div className="flex-1">
                <p className="font-medium">{language.name}</p>
                <p className="text-xs text-gray-500">{language.nativeName}</p>
              </div>
              {locale === localeCode && (
                <span className="text-sage-green font-bold">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

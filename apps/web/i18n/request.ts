import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, type Locale, locales } from './config';

const isValidLocale = (locale: string | undefined): locale is Locale => {
  return typeof locale === 'string' && locales.includes(locale as Locale);
};

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = isValidLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Europe/London', // Set default timezone to avoid hydration mismatches
  };
});

export const locales = ['en', 'fr', 'de', 'nl', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
};



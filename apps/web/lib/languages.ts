// This file is deprecated - use @/i18n/config instead
// Keeping for backwards compatibility during migration

export { locales, localeNames, defaultLocale, type Locale } from '@/i18n/config';

// Legacy type for backwards compatibility
export type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

// Legacy array format for backwards compatibility
export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export const defaultLanguage: Language = languages[0];

export const getLanguageByCode = (code: string): Language => {
  return languages.find((lang) => lang.code === code) || defaultLanguage;
};

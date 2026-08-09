const DEFAULT_SITE_URL = 'https://www.auntiemarlenes.com';
const configuredSiteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/+$/, '');

export const SITE_URL = configuredSiteUrl.replace(
  /^https:\/\/auntiemarlenes\.com(?=\/|$)/i,
  DEFAULT_SITE_URL,
);

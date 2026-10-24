// Where Auntie Marlene's transactional email comes from.
//
// Fleet convention: a dedicated `notifications.<domain>` subdomain onboarded to
// Cloudflare Email Sending, so a bad send damages that subdomain's reputation
// rather than auntiemarlenes.com's. Replies go to the real inbox via Reply-To.
// Only CLOUDFLARE_EMAIL_API_TOKEN is a credential; CLOUDFLARE_ACCOUNT_ID,
// EMAIL_DOMAIN and EMAIL_FROM are ordinary configuration.

import { readEmailCredentials } from '@/lib/cloudflare-email';

const EMAIL_DOMAIN =
  process.env.EMAIL_DOMAIN?.trim() || 'notifications.auntiemarlenes.com';

const DISPLAY_NAME = "Auntie Marlene's";

/** Where replies land: the real shop inbox, not the sending subdomain. */
export const REPLY_TO = 'hello@auntiemarlenes.com';

export const getFromAddress = (prefix = 'hello', displayName = DISPLAY_NAME) =>
  process.env.EMAIL_FROM?.trim() ||
  `${displayName} <${prefix}@${EMAIL_DOMAIN}>`;

export const getEmailDomain = (): string => EMAIL_DOMAIN;

export const isEmailConfigured = (): boolean => readEmailCredentials() !== null;

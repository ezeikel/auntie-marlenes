'use server';

import { cookies } from 'next/headers';

/**
 * Set the country cookie for server-side country detection
 * Called by LocationContext when user changes country
 */
export async function setCountryCookie(countryCode: string) {
  const cookieStore = await cookies();
  cookieStore.set('auntie-marlenes-country', countryCode, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  });
}

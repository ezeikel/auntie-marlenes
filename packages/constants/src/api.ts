/**
 * API configuration constants
 */

export const SHOPIFY_CONFIG = {
  storeDomain: 'afro-hair-and-beauty.myshopify.com',
  storefrontApiEndpoint:
    'https://afro-hair-and-beauty.myshopify.com/api/2023-07/graphql.json',
  apiVersion: '2023-07',
} as const;

/**
 * Platform-specific API URLs for mobile
 */
export const getApiUrl = (platform: 'ios' | 'android' | 'web') => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  // Android emulator requires 10.0.2.2 to access host machine
  if (platform === 'android') {
    return (
      process.env.EXPO_PUBLIC_API_URL_ANDROID ||
      baseUrl.replace('localhost', '10.0.2.2')
    );
  }

  return baseUrl;
};

/**
 * Common HTTP headers for API requests
 */
export const API_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

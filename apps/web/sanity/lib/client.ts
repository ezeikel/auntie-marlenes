import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

// Read-only client for fetching data (uses CDN in production)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
});

// Write client for mutations (requires API token)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Check if write client is configured
export function isWriteClientConfigured(): boolean {
  return !!process.env.SANITY_API_TOKEN;
}

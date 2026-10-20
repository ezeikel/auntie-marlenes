import { defineCliConfig } from 'sanity/cli';

// Standalone Studio deployment is a later cutover step; never run as web deploy.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'zm0a7rrv',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
  studioHost: 'auntie-marlenes',
});

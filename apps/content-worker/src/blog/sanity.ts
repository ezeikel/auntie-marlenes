import { createClient } from '@sanity/client';

// Worker-side Sanity client. Uses @sanity/client directly (not next-sanity —
// this is a plain Node/Bun process with no Next runtime). Mirrors the web app's
// write path so generated posts land in the same dataset with the same shape.

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';
const apiVersion = process.env.SANITY_API_VERSION || '2025-02-19';

if (!projectId) {
  console.warn('[blog] SANITY_PROJECT_ID not set — Sanity writes will fail');
}

export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

// Idempotency anchor: the generationMeta.topic field on each generated post.
// Matches apps/web/sanity/lib/queries.ts so web + worker dedupe consistently.
export const coveredTopicsQuery = `*[_type == "post" && defined(generationMeta.topic)] { "topic": generationMeta.topic }`;

export const topicExistsQuery = `count(*[_type == "post" && generationMeta.topic == $topic]) > 0`;

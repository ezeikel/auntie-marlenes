import { perplexity } from '@ai-sdk/perplexity';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { BlogTopic } from './topics';

const researchSchema = z.object({
  summary: z.string().min(80).max(1_200),
  keyFacts: z.array(z.string().min(20).max(500)).min(3).max(10),
  sources: z
    .array(
      z.object({
        title: z.string().min(3).max(200),
        publisher: z.string().min(2).max(120),
        url: z.string().url(),
      }),
    )
    .min(2)
    .max(8),
  checkedAt: z.string(),
});

export type BlogResearch = z.infer<typeof researchSchema>;

export const isPublicHttpsUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return !(
      host === 'localhost' ||
      host.endsWith('.local') ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host === '::1'
    );
  } catch {
    return false;
  }
};

const sourceIsReachable = async (url: string): Promise<boolean> => {
  if (!isPublicHttpsUrl(url)) return false;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': "Auntie Marlene's Editorial Research/1.0",
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return false;
    const contentType = response.headers.get('content-type') ?? '';
    return /text\/html|application\/pdf/i.test(contentType);
  } catch {
    return false;
  }
};

const SYSTEM = `You are the research desk for Auntie Marlene's, a Black-owned
hair and beauty supply store in South London. Return current, verifiable facts
for an educational article about textured hair, protective styling or
melanin-rich skincare.

Rules:
- Prefer primary sources: an actual product manufacturer for directions and
  ingredients, NHS or a recognised professional body for health information,
  and peer-reviewed research for scientific claims.
- A retailer description can establish what the shop stocks, but not a medical
  or performance claim.
- Do not turn hair traditions or personal routines into universal facts.
- Do not diagnose, prescribe, promise growth, claim a product treats a
  condition, or invent a statistic, study, ingredient or product benefit.
- Make uncertainty and limits explicit. Use British English.
- Return direct article or product URLs, never search-result pages.`;

export async function researchBlogTopic(input: {
  topic: BlogTopic;
  productContext: string;
  checkedAt?: string;
}): Promise<BlogResearch> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is required for source-checked blogs');
  }

  const checkedAt = input.checkedAt ?? new Date().toISOString();
  const { object } = await generateObject({
    model: perplexity('sonar'),
    schema: researchSchema,
    system: SYSTEM,
    prompt: `Research this article: "${input.topic.topic}".
Keywords: ${input.topic.keywords.join(', ')}.
Products confirmed in the live Auntie Marlene's catalogue:
${input.productContext || '(No close catalogue match; do not invent one.)'}
The research date is ${checkedAt}.`,
  });

  const unique = new Map<string, BlogResearch['sources'][number]>();
  for (const source of object.sources) unique.set(source.url, source);
  const candidates = [...unique.values()];
  const checks = await Promise.all(
    candidates.map(async (source) => ({
      source,
      reachable: await sourceIsReachable(source.url),
    })),
  );
  const sources = checks
    .filter((check) => check.reachable)
    .map((check) => check.source);

  if (sources.length < 2) {
    throw new Error(
      `Research did not provide two reachable sources (${sources.length} verified)`,
    );
  }

  return { ...object, sources, checkedAt };
}

export function researchPrompt(research: BlogResearch): string {
  return [
    `Research checked at ${research.checkedAt}: ${research.summary}`,
    'Allowed factual notes:',
    ...research.keyFacts.map((fact) => `- ${fact}`),
    'Sources that must be cited as Markdown links:',
    ...research.sources.map(
      (source) => `- ${source.publisher}: ${source.title} (${source.url})`,
    ),
  ].join('\n');
}

export function validateResearchCitations(
  markdown: string,
  research: BlogResearch,
): void {
  const normalise = (value: string) => value.replace(/\/$/, '');
  const linkedUrls = new Set(
    [...markdown.matchAll(/\]\((https:\/\/[^)\s]+)\)/g)].map((match) =>
      normalise(match[1]),
    ),
  );
  const cited = research.sources.filter((source) =>
    linkedUrls.has(normalise(source.url)),
  );
  if (cited.length < 2) {
    throw new Error('Generated article did not cite two verified sources');
  }
}

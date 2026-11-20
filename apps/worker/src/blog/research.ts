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

// Perplexity retired Sonar Chat Completions on 27 September 2026 and now
// rejects `model: "sonar"`. Its replacement is the Agent API, where the `fast`
// effort level stands in for Sonar and no model id is sent.
const PERPLEXITY_AGENT_URL = 'https://api.perplexity.ai/v1/agent';
const PERPLEXITY_EFFORT = 'fast';

// What the model is asked to return. `checkedAt` is ours, never the model's.
const dossierSchema = researchSchema.omit({ checkedAt: true });

const DOSSIER_JSON_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    keyFacts: { type: 'array', items: { type: 'string' } },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          publisher: { type: 'string' },
          url: { type: 'string' },
        },
        required: ['title', 'publisher', 'url'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'keyFacts', 'sources'],
  additionalProperties: false,
} as const;

const agentResponseSchema = z.object({
  status: z.string().optional(),
  output: z.array(
    z
      .object({
        type: z.string(),
        content: z
          .array(
            z
              .object({ type: z.string(), text: z.string().optional() })
              .passthrough(),
          )
          .optional(),
      })
      .passthrough(),
  ),
});

/**
 * Ask Perplexity's Agent API for the source dossier. Every failure throws a
 * message with no response text in it, so Sentry keeps one issue per failure
 * kind; the provider's own wording goes to the log.
 */
export async function requestResearchDossier(input: {
  apiKey: string;
  instructions: string;
  prompt: string;
  fetchImpl?: typeof fetch;
}): Promise<z.infer<typeof dossierSchema>> {
  const response = await (input.fetchImpl ?? fetch)(PERPLEXITY_AGENT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      effort: PERPLEXITY_EFFORT,
      instructions: input.instructions,
      input: input.prompt,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'research_dossier', schema: DOSSIER_JSON_SCHEMA },
      },
    }),
    // A schema Perplexity has not seen before can take 10 to 30 seconds to prepare.
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error(
      `[blog] Perplexity research rejected (HTTP ${response.status}):`,
      detail.slice(0, 500),
    );
    throw new Error(
      `Perplexity research request failed (HTTP ${response.status})`,
    );
  }

  const parsed = agentResponseSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (!parsed.success) {
    throw new Error('Perplexity research response had an unexpected shape');
  }
  if (parsed.data.status && parsed.data.status !== 'completed') {
    console.error(`[blog] Perplexity research status: ${parsed.data.status}`);
    throw new Error('Perplexity research run did not complete');
  }

  const text = parsed.data.output
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === 'output_text')
    .map((part) => part.text ?? '')
    .join('')
    .trim()
    // Tolerate a Markdown code fence around the JSON.
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Perplexity research answer was not valid JSON');
  }
  const dossier = dossierSchema.safeParse(json);
  if (!dossier.success) {
    console.error(
      '[blog] Perplexity research failed the dossier schema:',
      dossier.error.issues.map((issue) => issue.path.join('.')).join(', '),
    );
    throw new Error('Perplexity research answer failed the dossier schema');
  }
  return dossier.data;
}

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
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is required for source-checked blogs');
  }

  const checkedAt = input.checkedAt ?? new Date().toISOString();
  const object = await requestResearchDossier({
    apiKey,
    instructions: SYSTEM,
    prompt: `Research this article: "${input.topic.topic}".
Keywords: ${input.topic.keywords.join(', ')}.
Products confirmed in the live Auntie Marlene's catalogue:
${input.productContext || '(No close catalogue match; do not invent one.)'}
The research date is ${checkedAt}.

Return a JSON object with: "summary" (80 to 1,200 characters), "keyFacts" (3 to
10 facts, each 20 to 500 characters) and "sources" (2 to 8 items, each with
"title", "publisher" and a direct https "url").`,
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

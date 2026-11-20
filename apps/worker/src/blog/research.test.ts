import { describe, expect, it, vi } from 'vitest';
import {
  type BlogResearch,
  isPublicHttpsUrl,
  requestResearchDossier,
  validateResearchCitations,
} from './research';

const research: BlogResearch = {
  summary:
    'A sufficiently detailed research summary used to exercise the citation quality gate safely.',
  keyFacts: [
    'The first fact is long enough for the production research schema.',
    'The second fact is long enough for the production research schema.',
    'The third fact is long enough for the production research schema.',
  ],
  sources: [
    {
      title: 'Manufacturer directions',
      publisher: 'Example manufacturer',
      url: 'https://manufacturer.example/product',
    },
    {
      title: 'Professional guidance',
      publisher: 'Example professional body',
      url: 'https://professional.example/guidance/',
    },
  ],
  checkedAt: '2026-08-11T10:00:00.000Z',
};

describe('research source safety', () => {
  it('accepts public HTTPS URLs and rejects local or private targets', () => {
    expect(isPublicHttpsUrl('https://www.nhs.uk/conditions/')).toBe(true);
    expect(isPublicHttpsUrl('http://www.nhs.uk/conditions/')).toBe(false);
    expect(isPublicHttpsUrl('https://localhost/private')).toBe(false);
    expect(isPublicHttpsUrl('https://127.0.0.1/private')).toBe(false);
    expect(isPublicHttpsUrl('https://192.168.1.2/private')).toBe(false);
    expect(isPublicHttpsUrl('not a URL')).toBe(false);
  });
});

describe('research citation gate', () => {
  it('accepts two exact verified Markdown links', () => {
    expect(() =>
      validateResearchCitations(
        '[Directions](https://manufacturer.example/product) and [guidance](https://professional.example/guidance).',
        research,
      ),
    ).not.toThrow();
  });

  it('fails closed when fewer than two verified sources are cited', () => {
    expect(() =>
      validateResearchCitations(
        '[Only one](https://manufacturer.example/product) and [unverified](https://other.example/article).',
        research,
      ),
    ).toThrow('Generated article did not cite two verified sources');
  });
});

describe('Perplexity research request', () => {
  const dossier = {
    summary: research.summary,
    keyFacts: research.keyFacts,
    sources: research.sources,
  };
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  const agentAnswer = (text: string) => ({
    id: 'resp_test',
    object: 'response',
    status: 'completed',
    model: 'provider/model',
    output: [
      { type: 'search_results', results: [] },
      {
        type: 'message',
        role: 'assistant',
        status: 'completed',
        content: [{ type: 'output_text', text, annotations: [] }],
      },
    ],
  });
  const request = (fetchImpl: typeof fetch) =>
    requestResearchDossier({
      apiKey: 'test-key',
      instructions: 'Research rules',
      prompt: 'Research this article',
      fetchImpl,
    });

  it('calls the Agent API with an effort level and no retired Sonar model', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      json(agentAnswer(JSON.stringify(dossier))),
    );

    await expect(request(fetchImpl)).resolves.toEqual(dossier);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.perplexity.ai/v1/agent');
    expect(new Headers(init?.headers).get('authorization')).toBe(
      'Bearer test-key',
    );
    const body = JSON.parse(String(init?.body));
    expect(body).not.toHaveProperty('model');
    expect(body).not.toHaveProperty('messages');
    expect(body).toMatchObject({
      effort: 'fast',
      instructions: 'Research rules',
      input: 'Research this article',
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'research_dossier' },
      },
    });
    expect(body.response_format.json_schema.schema.required).toEqual([
      'summary',
      'keyFacts',
      'sources',
    ]);
  });

  it('reads a fenced JSON answer', async () => {
    const fenced = `\`\`\`json\n${JSON.stringify(dossier)}\n\`\`\``;
    await expect(
      request(async () => json(agentAnswer(fenced))),
    ).resolves.toEqual(dossier);
  });

  it('reports a rejected request without the provider text in the message', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      request(async () =>
        json({ error: { message: 'synthetic provider wording 12345' } }, 400),
      ),
    ).rejects.toThrow(/^Perplexity research request failed \(HTTP 400\)$/);
    error.mockRestore();
  });

  it('fails closed on an unfinished run, prose, or a short dossier', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      request(async () =>
        json({ ...agentAnswer(JSON.stringify(dossier)), status: 'failed' }),
      ),
    ).rejects.toThrow('Perplexity research run did not complete');
    await expect(
      request(async () => json(agentAnswer('Here is what I found.'))),
    ).rejects.toThrow('Perplexity research answer was not valid JSON');
    await expect(
      request(async () =>
        json(
          agentAnswer(
            JSON.stringify({ ...dossier, sources: [dossier.sources[0]] }),
          ),
        ),
      ),
    ).rejects.toThrow('Perplexity research answer failed the dossier schema');
    await expect(request(async () => json({ choices: [] }))).rejects.toThrow(
      'Perplexity research response had an unexpected shape',
    );
    error.mockRestore();
  });
});

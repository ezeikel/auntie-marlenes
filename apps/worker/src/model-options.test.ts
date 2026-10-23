import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { describe, expect, it } from 'vitest';
import { MODEL_IDS } from './blog/models';
import { sonnet5NoThinking } from './model-options';

// No network: a stub fetch captures the request body the provider builds.
const captureRequestBody = async (
  providerOptions?: typeof sonnet5NoThinking,
) => {
  let body: Record<string, unknown> | undefined;
  const anthropic = createAnthropic({
    apiKey: 'test-key',
    fetch: async (_url, init) => {
      body = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({
          id: 'msg_test',
          type: 'message',
          role: 'assistant',
          model: MODEL_IDS.CLAUDE_SONNET_5,
          content: [{ type: 'text', text: 'ok' }],
          stop_reason: 'end_turn',
          stop_sequence: null,
          usage: { input_tokens: 1, output_tokens: 1 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    },
  });
  await generateText({
    model: anthropic(MODEL_IDS.CLAUDE_SONNET_5),
    prompt: 'ping',
    providerOptions,
  });
  return body;
};

describe('sonnet5NoThinking', () => {
  it('is only used while the text model is claude-sonnet-5', () => {
    expect(MODEL_IDS.CLAUDE_SONNET_5).toBe('claude-sonnet-5');
  });

  it('sends thinking disabled in the Anthropic request body', async () => {
    const body = await captureRequestBody(sonnet5NoThinking);
    expect(body?.thinking).toEqual({ type: 'disabled' });
  });
});

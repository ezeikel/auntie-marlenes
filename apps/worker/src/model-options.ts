import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';

// claude-sonnet-5 runs adaptive thinking when a request has no `thinking`
// field; it bills as output and counts toward maxOutputTokens. Short jobs
// (captions, headlines, blog metadata, search terms, topic lists, the Pexels
// judge) switch it off. `disabled` is valid on claude-sonnet-5 only:
// claude-sonnet-5-5 rejects it with a 400, so change this if the model moves.
export const sonnet5NoThinking = {
  anthropic: { thinking: { type: 'disabled' } },
} satisfies { anthropic: AnthropicLanguageModelOptions };

// Chewy Bytes Ops bot. Keep channel IDs aligned with the fleet-slack playbook.
const channels = {
  alerts: 'C0CGYBJBABC',
  social: 'C0CGTFB4VHT',
} as const;

type SlackChannel = keyof typeof channels;

/** Reports operational events without exposing user data or failing the caller. */
export async function postToSlack(
  channel: SlackChannel,
  title: string,
  lines: readonly string[] = [],
  content?: {
    image?: { url: string; alt: string };
    links: readonly { url: string; label: string }[];
  },
): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;
  try {
    const text = [`Auntie Marlene's: ${title}`, ...lines].join('\n');
    const payload = {
      channel: channels[channel],
      text: [text, ...(content?.links.map(({ url }) => url) ?? [])].join('\n'),
      mrkdwn: false,
      unfurl_links: false,
      unfurl_media: false,
    };
    const blocks = content
      ? [
          ...Array.from(text.matchAll(/[\s\S]{1,2800}/gu), ([part]) => ({
            type: 'section',
            text: { type: 'plain_text', text: part },
          })),
          ...(content.image
            ? [
                {
                  type: 'image',
                  image_url: content.image.url,
                  alt_text: content.image.alt,
                },
              ]
            : []),
          ...content.links
            .filter(({ url }) => !/[<|>\s]/u.test(url))
            .map(({ url, label }) => ({
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `<${url.replaceAll('&', '&amp;')}|${label}>`,
                },
              ],
            })),
        ]
      : undefined;
    const post = (withPreview: boolean) =>
      fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(withPreview ? { ...payload, blocks } : payload),
        signal: AbortSignal.timeout(10_000),
      });
    let response = await post(Boolean(blocks));
    let result = (await response.json()) as { ok?: boolean; error?: string };
    if (
      blocks &&
      response.ok &&
      !result.ok &&
      result.error === 'invalid_blocks'
    ) {
      response = await post(false);
      result = (await response.json()) as typeof result;
    }
    if (!response.ok || !result.ok) {
      console.warn('[slack] Post rejected', {
        channel,
        code: result.error ?? response.status,
      });
      return;
    }
    console.info('[slack] Posted', { channel });
  } catch {
    console.warn('[slack] Post failed', { channel });
  }
}

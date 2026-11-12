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
  token = process.env.SLACK_BOT_TOKEN,
): Promise<void> {
  if (!token) return;
  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        channel: channels[channel],
        text: [`Auntie Marlene's: ${title}`, ...lines].join('\n'),
        mrkdwn: false,
        unfurl_links: false,
        unfurl_media: false,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await response.json()) as { ok?: boolean; error?: string };
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

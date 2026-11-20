import { describe, expect, it, vi } from 'vitest';
import {
  createPublishJob,
  type PublishOutcome,
  providerErrorContext,
} from './publish-job';

const setup = () => {
  const capture = vi.fn();
  const alert = vi.fn();
  return { capture, alert, run: createPublishJob({ capture, alert }) };
};

const published: PublishOutcome = { status: 200, body: { success: true } };

// Shaped like a provider SDK error: a status and the response body.
const providerRefusal = () =>
  Object.assign(new Error('Forbidden'), {
    status: 403,
    body: { detail: 'synthetic refusal reason' },
  });

describe('scheduled publish job', () => {
  it('reports a thrown error exactly once, with the provider reason', async () => {
    const { capture, alert, run } = setup();
    const error = providerRefusal();

    await run(async () => {
      throw error;
    });

    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith(error, {
      tags: { job: 'publish-next' },
      contexts: {
        provider: {
          status: 403,
          body: '{"detail":"synthetic refusal reason"}',
        },
      },
    });
    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith('Social publishing failed');
  });

  it('keeps run details out of the message when a platform fails', async () => {
    const { capture, run } = setup();

    await run(async () => ({
      status: 200,
      body: {
        success: false,
        captions: { instagram: 'synthetic caption' },
        publishing: [
          { platform: 'instagram', type: 'reel', success: true },
          {
            platform: 'facebook',
            type: 'post',
            success: false,
            error: 'synthetic platform error',
          },
        ],
      },
    }));

    expect(capture).toHaveBeenCalledTimes(1);
    const [error, hint] = capture.mock.calls[0];
    expect((error as Error).message).toBe(
      'Scheduled publishing did not complete',
    );
    expect(hint.contexts.publish).toEqual({
      status: 200,
      reason: '',
      results: [
        { platform: 'instagram', type: 'reel', success: true, error: null },
        {
          platform: 'facebook',
          type: 'post',
          success: false,
          error: 'synthetic platform error',
        },
      ],
    });
  });

  it('reports a run that found nothing to publish', async () => {
    const { capture, run } = setup();
    await run(async () => ({
      status: 404,
      body: { error: 'No products available' },
    }));
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture.mock.calls[0][1].contexts.publish).toMatchObject({
      status: 404,
      reason: 'No products available',
    });
  });

  it('alerts Slack on change only: first failure, then recovery', async () => {
    const { capture, alert, run } = setup();
    const fail = async () => {
      throw new Error('synthetic failure');
    };

    await run(async () => published);
    expect(alert).not.toHaveBeenCalled();

    await run(fail);
    await run(fail);
    expect(capture).toHaveBeenCalledTimes(2);
    expect(alert.mock.calls).toEqual([['Social publishing failed']]);

    await run(async () => published);
    await run(async () => published);
    expect(alert.mock.calls).toEqual([
      ['Social publishing failed'],
      ['Social publishing recovered'],
    ]);
  });
});

describe('provider error context', () => {
  it('reads status and a clipped body, and ignores other errors', () => {
    expect(providerErrorContext(new Error('plain'))).toBeNull();
    expect(providerErrorContext('text')).toBeNull();
    expect(
      providerErrorContext({ status: 403, body: 'x'.repeat(2_000) })?.body,
    ).toHaveLength(500);
    expect(providerErrorContext({ status: 500 })).toEqual({
      status: 500,
      body: '',
    });
  });
});

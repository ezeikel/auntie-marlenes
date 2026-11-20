/**
 * Background runner for the scheduled social publish.
 *
 * One failed run is reported once: the error itself goes to Sentry, and Slack
 * hears about it only when the outcome changes (first failure, then recovery).
 */

export type PublishOutcome = {
  status: number;
  body: Record<string, unknown>;
};

type CaptureHint = {
  tags: Record<string, string>;
  contexts?: Record<string, Record<string, unknown>>;
};

export type PublishJobDeps = {
  capture: (error: unknown, hint: CaptureHint) => void;
  alert: (title: string) => void;
};

const TAGS = { job: 'publish-next' } as const;

const clip = (value: unknown, max = 500): string => {
  let text: string;
  try {
    text = typeof value === 'string' ? value : JSON.stringify(value);
  } catch {
    text = String(value);
  }
  return (text ?? '').slice(0, max);
};

/**
 * The HTTP status and response body of a provider SDK error that carries
 * both, so a refusal such as a 403 shows its reason in Sentry. Null
 * for any other error.
 */
export function providerErrorContext(
  error: unknown,
): { status: number; body: string } | null {
  if (typeof error !== 'object' || error === null) return null;
  const { status, body } = error as { status?: unknown; body?: unknown };
  if (typeof status !== 'number') return null;
  return { status, body: clip(body) };
}

/** Per-platform outcomes of a run that finished without publishing everything. */
const publishingContext = (body: Record<string, unknown>) => {
  const results = Array.isArray(body.publishing) ? body.publishing : [];
  return {
    results: results.slice(0, 10).map((result) => {
      const { platform, type, success, error } = (result ?? {}) as Record<
        string,
        unknown
      >;
      return {
        platform,
        type,
        success,
        error: error ? clip(error, 300) : null,
      };
    }),
  };
};

export function createPublishJob(deps: PublishJobDeps) {
  let lastFailed = false;

  const failed = () => {
    if (!lastFailed) deps.alert('Social publishing failed');
    lastFailed = true;
  };

  return async function runPublishJob(
    execute: () => Promise<PublishOutcome>,
  ): Promise<void> {
    let outcome: PublishOutcome;
    try {
      outcome = await execute();
    } catch (error) {
      const provider = providerErrorContext(error);
      deps.capture(error, {
        tags: TAGS,
        ...(provider ? { contexts: { provider } } : {}),
      });
      failed();
      return;
    }

    if (outcome.status >= 400 || outcome.body.success === false) {
      // A fixed message: the details differ every run and belong in context.
      deps.capture(new Error('Scheduled publishing did not complete'), {
        tags: TAGS,
        contexts: {
          publish: {
            status: outcome.status,
            reason: clip(outcome.body.error ?? '', 200),
            ...publishingContext(outcome.body),
          },
        },
      });
      failed();
      return;
    }

    if (lastFailed) deps.alert('Social publishing recovered');
    lastFailed = false;
  };
}

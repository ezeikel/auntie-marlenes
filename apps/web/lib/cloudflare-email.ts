/**
 * Transactional email through Cloudflare Email Sending (REST API).
 *
 * One code path for every host: Workers, Vercel, Hetzner and Node scripts all
 * call the same endpoint, so the module can be copied between fleet apps
 * unchanged (fleet-copying-modules: the constraint lives in the caller, not here).
 * The sender domain must be onboarded to Email Sending on the account that owns
 * the token (`wrangler email sending enable <domain>` or the dashboard).
 *
 * Docs: https://developers.cloudflare.com/email-service/api/send-emails/rest-api/
 */

export type EmailAttachment = {
  filename: string;
  /** Base64-encoded file body. */
  content: string;
  /** MIME type, e.g. application/pdf. */
  type: string;
  disposition?: 'attachment' | 'inline';
};

export type SendEmailInput = {
  /** `Name <addr@domain>` or a bare address on an onboarded sending domain. */
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  /** Custom headers; `X-*` and the allowlisted list headers only. */
  headers?: Record<string, string>;
  /** Up to 32; the whole message must stay under 5 MiB. */
  attachments?: EmailAttachment[];
};

export type EmailCredentials = { accountId: string; token: string };

export type SendEmailResult =
  | { ok: true; messageId: string; suppressed: string[] }
  | { ok: false; code: number | string; message: string };

type ApiError = { code?: number; message?: string };
type ApiResponse = {
  success: boolean;
  errors?: ApiError[];
  result?: {
    message_id?: string;
    delivered?: string[];
    queued?: string[];
    permanent_bounces?: string[];
    suppressed_recipients?: string[];
  } | null;
};

const API = 'https://api.cloudflare.com/client/v4';
const TIMEOUT_MS = 15_000;

/** Reads the sender credential from the environment; null means email is not configured. */
export const readEmailCredentials = (): EmailCredentials | null => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token = process.env.CLOUDFLARE_EMAIL_API_TOKEN?.trim();
  return accountId && token && token.length > 20 ? { accountId, token } : null;
};

/** Sends one email. Never throws: a missing credential, network failure or API error is an `ok: false` result. */
export const sendEmail = async (
  input: SendEmailInput,
  credentials: EmailCredentials | null = readEmailCredentials(),
): Promise<SendEmailResult> => {
  if (!credentials)
    return {
      ok: false,
      code: 'not_configured',
      message: 'CLOUDFLARE_EMAIL_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is not set',
    };
  if (!input.html && !input.text)
    return { ok: false, code: 'no_body', message: 'html or text is required' };

  const body: Record<string, unknown> = {
    from: input.from,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
  };
  if (input.html) body.html = input.html;
  if (input.text) body.text = input.text;
  if (input.replyTo) body.reply_to = input.replyTo;
  if (input.cc?.length) body.cc = input.cc;
  if (input.bcc?.length) body.bcc = input.bcc;
  if (input.headers && Object.keys(input.headers).length)
    body.headers = input.headers;
  if (input.attachments?.length) {
    body.attachments = input.attachments.map((a) => ({
      ...a,
      disposition: a.disposition ?? 'attachment',
    }));
  }

  try {
    const response = await fetch(
      `${API}/accounts/${credentials.accountId}/email/sending/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${credentials.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    const data = (await response
      .json()
      .catch(() => null)) as ApiResponse | null;
    if (!response.ok || !data?.success) {
      const first = data?.errors?.[0];
      return {
        ok: false,
        code: first?.code ?? response.status,
        message: first?.message ?? `HTTP ${response.status}`,
      };
    }
    return {
      ok: true,
      messageId: data.result?.message_id ?? '',
      suppressed: data.result?.suppressed_recipients ?? [],
    };
  } catch (error) {
    return {
      ok: false,
      code: 'network',
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

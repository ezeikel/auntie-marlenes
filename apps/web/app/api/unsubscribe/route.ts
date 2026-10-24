import { NextResponse } from 'next/server';
import { unsubscribeNewsletterSubscriber } from '@/lib/newsletter-subscribers';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';

/**
 * RFC 8058 one-click unsubscribe, the target of the List-Unsubscribe header.
 * Mail clients POST `List-Unsubscribe=One-Click` to the signed URL; the token
 * is checked before anything changes. GET (a person following the header
 * link) goes to the confirm page instead, so mail scanners cannot unsubscribe.
 */

const readParams = async (request: Request) => {
  const url = new URL(request.url);
  let email = url.searchParams.get('e');
  let token = url.searchParams.get('t');
  if (!email || !token) {
    const form = await request.formData().catch(() => null);
    email ||= form?.get('e')?.toString() ?? null;
    token ||= form?.get('t')?.toString() ?? null;
  }
  return { email, token };
};

export async function POST(request: Request) {
  const { email, token } = await readParams(request);
  if (!email || !(await verifyUnsubscribeToken(email, token))) {
    return NextResponse.json(
      { error: 'Invalid unsubscribe link' },
      { status: 400 },
    );
  }
  const result = await unsubscribeNewsletterSubscriber(email);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Could not unsubscribe, please try again' },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const target = new URL('/unsubscribe', url);
  for (const key of ['e', 't']) {
    const value = url.searchParams.get(key);
    if (value) target.searchParams.set(key, value);
  }
  return NextResponse.redirect(target, 303);
}

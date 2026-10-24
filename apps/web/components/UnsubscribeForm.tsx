'use client';

import { useActionState } from 'react';
import {
  confirmUnsubscribe,
  type UnsubscribeState,
} from '@/app/actions/unsubscribe';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type UnsubscribeFormProps = {
  email: string;
  token: string;
};

const initialState: UnsubscribeState = { status: 'idle' };

const UnsubscribeForm = ({ email, token }: UnsubscribeFormProps) => {
  const [state, formAction, pending] = useActionState(
    confirmUnsubscribe,
    initialState,
  );

  if (state.status === 'done') {
    return (
      <div>
        <h1 className="text-4xl font-playfair font-bold text-cocoa mb-4">
          You&apos;re unsubscribed
        </h1>
        <p className="text-gray-600 mb-8">
          We won&apos;t send marketing emails to{' '}
          <span className="font-semibold text-cocoa">{email}</span> any more.
          You&apos;ll still get emails about orders you place, and you can sign
          up again at any time.
        </p>
        <Button asChild size="lg">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <h1 className="text-4xl font-playfair font-bold text-cocoa mb-4">
        Unsubscribe
      </h1>
      <p className="text-gray-600 mb-8">
        Stop marketing emails from Auntie Marlene&apos;s to{' '}
        <span className="font-semibold text-cocoa">{email}</span>?
      </p>
      <input type="hidden" name="e" value={email} />
      <input type="hidden" name="t" value={token} />
      {state.status === 'invalid' && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          This unsubscribe link is not valid. Please use the link in our most
          recent email, or email hello@auntiemarlenes.com.
        </p>
      )}
      {state.status === 'error' && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          Something went wrong. Please try again in a moment.
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Unsubscribing...' : 'Unsubscribe'}
      </Button>
    </form>
  );
};

export default UnsubscribeForm;

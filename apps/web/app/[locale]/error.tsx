'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-playfair font-bold text-terracotta mb-4">
        Oops
      </h1>
      <h2 className="text-2xl font-playfair font-bold text-cocoa mb-4">
        Something went wrong
      </h2>
      <p className="text-gray-600 max-w-md mb-8">
        We&apos;re sorry, an unexpected error occurred. Please try again or
        return to the homepage.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-sage-green px-6 py-3 text-sm font-bold text-white hover:bg-sage-green/90 transition-colors"
        >
          Try Again
        </button>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md border-2 border-cocoa px-6 py-3 text-sm font-bold text-cocoa hover:bg-cocoa hover:text-white transition-colors"
        >
          Homepage
        </a>
      </div>
    </div>
  );
}

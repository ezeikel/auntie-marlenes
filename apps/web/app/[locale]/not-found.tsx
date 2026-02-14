import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-playfair font-bold text-terracotta mb-4">
        404
      </h1>
      <h2 className="text-2xl font-playfair font-bold text-cocoa mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 max-w-md mb-8">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
        have been moved or no longer exists.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-sage-green px-6 py-3 text-sm font-bold text-white hover:bg-sage-green/90 transition-colors"
      >
        Back to Homepage
      </Link>
    </div>
  );
}

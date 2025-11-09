import Link from 'next/link';

export default function OGPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">OpenGraph Image Preview</h1>

        {/* Navigation */}
        <div className="mb-6 flex gap-4">
          <Link
            href="/og-preview/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            View Product OG Images →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Default OG Image</h2>
          <div className="border rounded overflow-hidden">
            <img
              src="/opengraph-image"
              alt="OpenGraph preview"
              className="w-full"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Dimensions: 1200x630px (Standard OG image size)
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            How it appears on social media:
          </h2>

          {/* Twitter Mock */}
          <div className="mb-6 border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-400 rounded-full"></div>
                <div>
                  <div className="font-bold">Auntie Marlene's</div>
                  <div className="text-sm text-gray-600">@auntiemarlenes</div>
                </div>
              </div>
            </div>
            <img
              src="/opengraph-image"
              alt="Twitter preview"
              className="w-full"
            />
            <div className="p-4 bg-white">
              <div className="font-bold">
                Auntie Marlene's | Black Beauty Supply Store Online
              </div>
              <div className="text-sm text-gray-600">
                Your modern Black beauty supply store. Shop braiding hair...
              </div>
              <div className="text-xs text-gray-500 mt-1">
                auntiemarlenes.com
              </div>
            </div>
          </div>

          {/* Facebook Mock */}
          <div className="border rounded-lg overflow-hidden">
            <img
              src="/opengraph-image"
              alt="Facebook preview"
              className="w-full"
            />
            <div className="p-4 bg-gray-50">
              <div className="text-xs text-gray-500 uppercase mb-1">
                auntiemarlenes.com
              </div>
              <div className="font-bold text-lg">
                Auntie Marlene's | Black Beauty Supply Store Online
              </div>
              <div className="text-sm text-gray-600">
                Your modern Black beauty supply store. Shop braiding hair, wigs,
                hair extensions...
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Testing Tips:</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>
              • Direct image URL:{' '}
              <code className="bg-white px-2 py-1 rounded">
                /opengraph-image
              </code>
            </li>
            <li>
              • Use Facebook Sharing Debugger to test:{' '}
              <a
                href="https://developers.facebook.com/tools/debug/"
                target="_blank"
                className="text-blue-600 underline"
              >
                developers.facebook.com/tools/debug/
              </a>
            </li>
            <li>
              • Use Twitter Card Validator:{' '}
              <a
                href="https://cards-dev.twitter.com/validator"
                target="_blank"
                className="text-blue-600 underline"
              >
                cards-dev.twitter.com/validator
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

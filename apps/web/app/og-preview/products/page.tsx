import { getProducts } from '@/app/actions';
import Link from 'next/link';

export default async function ProductOGPreviewPage() {
  const products = await getProducts();
  const sampleProducts = products.slice(0, 6); // Show first 6 products

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/og-preview"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Main OG Preview
          </Link>
          <h1 className="text-3xl font-bold mb-2">Product OpenGraph Images</h1>
          <p className="text-gray-600">
            Preview dynamic OG images for each product. Each product
            automatically gets its own branded share image!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sampleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Handle: {product.handle}
                </p>
              </div>

              <div className="p-4">
                <img
                  src={`/product/${product.handle}/opengraph-image`}
                  alt={`OG image for ${product.name}`}
                  className="w-full rounded border"
                />
              </div>

              <div className="p-4 bg-gray-50 border-t">
                <div className="text-xs space-y-1">
                  <div>
                    <strong>Direct URL:</strong>{' '}
                    <code className="bg-white px-2 py-1 rounded text-xs">
                      /product/{product.handle}/opengraph-image
                    </code>
                  </div>
                  <div>
                    <strong>Product Page:</strong>{' '}
                    <Link
                      href={`/product/${product.handle}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                    >
                      View Product →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">
            How Dynamic Product OG Images Work
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <strong>Automatic Generation:</strong> Each product gets a
                unique OG image using its Shopify data
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <strong>Product Image:</strong> Shows the actual product photo
                from Shopify
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <strong>Price Display:</strong> Shows current price, sale price,
                and "SALE" badge if applicable
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <strong>Stock Status:</strong> Green indicator when product is
                in stock
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <strong>Brand Consistency:</strong> Uses your custom fonts
                (Playfair Display + Inter) and brand colors
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <h3 className="font-semibold mb-2">Test on Social Media:</h3>
            <ul className="text-sm space-y-1">
              <li>
                • Share any product URL on Twitter, Facebook, or LinkedIn to see
                the custom OG image
              </li>
              <li>
                • Use{' '}
                <a
                  href="https://developers.facebook.com/tools/debug/"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Facebook Debugger
                </a>{' '}
                to test and refresh cache
              </li>
              <li>
                • Use{' '}
                <a
                  href="https://cards-dev.twitter.com/validator"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Twitter Card Validator
                </a>{' '}
                to preview
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/og-preview"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Default OG Image
          </Link>
        </div>
      </div>
    </div>
  );
}

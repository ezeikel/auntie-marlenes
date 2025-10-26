import { getProducts } from '@/app/actions';
import Link from 'next/link';
import type { Product } from '@/lib/constants';

export default async function DebugProductsPage() {
  let products: Product[] | undefined;
  let error: string | undefined;

  try {
    products = await getProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Product Debug Page</h1>

      {error ? (
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-800">Error fetching products: {error}</p>
        </div>
      ) : (
        <div>
          <p className="mb-4">Found {products?.length || 0} products</p>
          <div className="space-y-4">
            {products?.map((product) => (
              <div key={product.id} className="border p-4 rounded">
                <p className="font-bold">{product.name}</p>
                <p className="text-sm text-gray-600">
                  Handle: {product.handle}
                </p>
                <p className="text-sm text-gray-600">ID: {product.id}</p>
                <Link
                  href={`/product/${product.handle}`}
                  className="text-blue-600 hover:underline"
                >
                  View Product Page
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { getCategories, getProducts } from '@/app/actions';

export default async function DebugCategoriesPage() {
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Shopify Categories Debug</h1>

      <div className="mb-8 bg-blue-50 border border-blue-200 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">
          Categories Found in Shopify:
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category} className="text-lg">
                <strong>{category}</strong>
                <span className="text-sm text-gray-600 ml-2">
                  (URL: /
                  {category
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]+/g, '')}
                  )
                </span>
              </li>
            ))
          ) : (
            <li className="text-red-600">
              No categories found! Your products might not have Product Type set
              in Shopify.
            </li>
          )}
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">Products by Category:</h2>
        {categories.map((category) => {
          const productsInCategory = products.filter(
            (p) => p.category === category,
          );
          return (
            <div key={category} className="mb-4">
              <h3 className="font-semibold text-lg">
                {category} ({productsInCategory.length} products)
              </h3>
              <ul className="list-disc pl-6 text-sm text-gray-600">
                {productsInCategory.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Expected Nav Categories:</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Hair Care</li>
          <li>Skincare</li>
          <li>Wigs & Extensions</li>
          <li>Kids</li>
          <li>Men's</li>
        </ul>
        <p className="mt-4 text-sm text-gray-700">
          Make sure these match the categories shown above. If they don't,
          update the "Product type" field in Shopify for each product.
        </p>
      </div>
    </div>
  );
}

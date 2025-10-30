import {
  getProductByHandle,
  searchProducts,
  getProductSaveCount,
  getProducts,
} from '@/app/actions';
import ProductDetail from '@/components/ProductDetail';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Pre-render popular/recent products at build time
export async function generateStaticParams() {
  try {
    // Fetch all products to pre-render at build time
    // You can limit this if you have hundreds of products
    const products = await getProducts();
    return products.map((product) => ({
      handle: product.handle,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    // Return empty array so build doesn't fail
    return [];
  }
}

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

// Async component for dynamic save count (PPR)
async function SaveCountLoader({ productId }: { productId: string }) {
  const saveCount = await getProductSaveCount({ productId });
  return <>{saveCount}</>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { handle } = await params;

  let product;
  try {
    product = await getProductByHandle({ handle });
  } catch (error) {
    console.error(`Failed to fetch product with handle "${handle}":`, error);
    notFound();
  }

  // Shopify's HTML is already sanitized, so we can use it directly
  const sanitizedDescription = product.description;

  // Fetch related products - don't fail if this doesn't work
  let relatedProducts: Awaited<ReturnType<typeof searchProducts>> = [];
  try {
    relatedProducts = await searchProducts({
      productType: product.category,
      first: 9,
    });
  } catch (error) {
    console.error('Failed to fetch related products:', error);
  }

  // Filter out the current product and limit to 8
  const filteredRelatedProducts = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 8);

  return (
    <div className="bg-white min-h-screen">
      <ProductDetail
        product={product}
        relatedProducts={filteredRelatedProducts}
        sanitizedDescription={sanitizedDescription}
        // PPR: Wrap dynamic save count in Suspense
        saveCountSlot={
          <Suspense fallback={<span>0</span>}>
            <SaveCountLoader productId={product.id} />
          </Suspense>
        }
      />
    </div>
  );
};

export default ProductPage;

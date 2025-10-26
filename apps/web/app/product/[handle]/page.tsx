import {
  getProductByHandle,
  searchProducts,
  getProductSaveCount,
  getProducts,
} from '@/app/actions';
import ProductDetail from '@/components/ProductDetail';
import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { notFound } from 'next/navigation';

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

// Allow dynamic params for new products added after build
export const dynamicParams = true;

// ISR: Revalidate every hour (3600 seconds)
// This keeps pages static but fresh. Can be overridden by webhook revalidation.
export const revalidate = 3600;

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

const ProductPage = async ({ params }: ProductPageProps) => {
  const { handle } = await params;

  try {
    const product = await getProductByHandle({ handle });

    // Fetch save count for this product (still uses product.id for DB lookup)
    const saveCount = await getProductSaveCount({ productId: product.id });

    // Shopify's HTML is already sanitized, so we can use it directly
    const sanitizedDescription = product.description;

    // Fetch related products from the same category
    const relatedProducts = await searchProducts({
      productType: product.category,
      first: 9,
    });

    // Filter out the current product and limit to 8
    const filteredRelatedProducts = relatedProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 8);

    return (
      <div className="bg-white min-h-screen">
        <AnnouncementBanner />
        <Header />
        <ProductDetail
          product={{ ...product, saveCount }}
          relatedProducts={filteredRelatedProducts}
          sanitizedDescription={sanitizedDescription}
        />
        <Footer />
      </div>
    );
  } catch (error) {
    notFound();
  }
};

export default ProductPage;

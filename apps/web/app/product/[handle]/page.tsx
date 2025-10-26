import {
  getProductByHandle,
  searchProducts,
  getProductSaveCount,
} from '@/app/actions';
import ProductDetail from '@/components/ProductDetail';
import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { notFound } from 'next/navigation';

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

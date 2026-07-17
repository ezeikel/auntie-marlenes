import type { Metadata } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import {
  getProductByHandle,
  getProductSaveCount,
  getProducts,
  searchProducts,
} from '@/app/actions';
import DynamicProductPrice from '@/components/DynamicProductPrice';
import ProductDetail from '@/components/ProductDetail';
import { locales } from '@/i18n/config';
import { formatCurrency } from '@/lib/currency';
import { generateProductMetadata } from '@/lib/metadata';
import { generateBreadcrumbSchema, generateProductSchema } from '@/lib/schema';

// Default country for static pre-rendering
const DEFAULT_COUNTRY = 'GB';

// Pre-render popular/recent products at build time
export async function generateStaticParams() {
  try {
    // Fetch all products to pre-render at build time
    // You can limit this if you have hundreds of products
    const products = await getProducts();
    // Generate params for each locale and product combination
    return locales.flatMap((locale) =>
      products.map((product) => ({
        locale,
        handle: product.handle,
      })),
    );
  } catch (error) {
    console.error('Failed to generate static params:', error);
    // Return empty array so build doesn't fail
    return [];
  }
}

type ProductPageProps = {
  params: Promise<{ locale: string; handle: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle, locale } = await params;
  setRequestLocale(locale);

  try {
    const product = await getProductByHandle({
      handle,
      countryCode: DEFAULT_COUNTRY,
    });

    // Extract plain text from HTML description
    const plainDescription = product.description
      .replace(/<[^>]*>/g, '')
      .substring(0, 200);

    return generateProductMetadata({
      productName: product.name,
      brand: product.brand,
      description: plainDescription,
      handle: product.handle,
      image: product.images?.[0] || product.image,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      inStock: product.inStock,
    });
  } catch {
    // Fallback metadata if product not found
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }
}

// Cached component for the save count (PPR)
// Product id becomes part of the cache key automatically; the 5 min cache
// stops crawler traffic from waking Neon on every request
async function SaveCountLoader({ productId }: { productId: string }) {
  'use cache';
  cacheLife('save-count'); // Cache for 5 minutes
  cacheTag('saved-counts'); // Tag for invalidation on save/unsave

  const saveCount = await getProductSaveCount({ productId });
  return <>{saveCount}</>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { handle, locale } = await params;
  setRequestLocale(locale);

  // Use default country for static pre-rendering (PPR approach)
  // Dynamic pricing is handled client-side via DynamicProductPrice component
  let product;
  try {
    product = await getProductByHandle({
      handle,
      countryCode: DEFAULT_COUNTRY,
    });
  } catch (error) {
    console.error(`Failed to fetch product with handle "${handle}":`, error);
    notFound();
  }

  // Shopify's HTML is already sanitized, so we can use it directly
  const sanitizedDescription = product.description;

  // Fetch related products with default country for static rendering
  let relatedProducts: Awaited<ReturnType<typeof searchProducts>> = [];
  try {
    relatedProducts = await searchProducts({
      productType: product.category,
      first: 9,
      countryCode: DEFAULT_COUNTRY,
    });
  } catch (error) {
    console.error('Failed to fetch related products:', error);
  }

  // Filter out the current product and limit to 8
  const filteredRelatedProducts = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 8);

  // Generate Product schema for rich snippets
  const productSchema = generateProductSchema({
    name: product.name,
    description: sanitizedDescription.replace(/<[^>]*>/g, '').substring(0, 300),
    image: product.images?.[0] || product.image,
    brand: product.brand,
    sku: product.id,
    price: product.price,
    currency: 'GBP',
    availability: product.inStock ? 'InStock' : 'OutOfStock',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com'}/product/${product.handle}`,
    ratingValue: product.rating,
    reviewCount: product.reviewCount,
  });

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    {
      name: 'Home',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com',
    },
    {
      name: product.category || 'Products',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com'}/${product.category?.toLowerCase().replace(/\s+/g, '-') || 'shop'}`,
    },
    {
      name: product.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com'}/product/${product.handle}`,
    },
  ]);

  return (
    <>
      {/* Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
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
          // PPR: Dynamic pricing based on user's location
          priceSlot={
            <DynamicProductPrice
              productHandle={product.handle}
              staticPrice={product.price}
              staticCurrencyCode={product.currencyCode}
              compareAtPrice={product.compareAtPrice}
            />
          }
          // Static fallback price for SSR
          staticPriceFallback={formatCurrency(
            product.price,
            product.currencyCode,
          )}
        />
      </div>
    </>
  );
};

export default ProductPage;

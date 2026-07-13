import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { searchProducts } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { getServerCountry } from '@/lib/server-location';
import ProductCard from './ProductCard';

async function CachedNewArrivals({ country }: { country: string }) {
  'use cache';
  cacheLife('days');
  cacheTag('new-arrivals');

  const products = await searchProducts({
    query: 'tag:new-arrival',
    sortKey: 'CREATED_AT',
    reverse: true,
    first: 8,
    countryCode: country,
  });

  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4 uppercase">
            New Arrivals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The latest additions to our collection — freshly curated for you.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            className="border-cocoa text-cocoa hover:bg-cocoa hover:text-white px-8"
          >
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const NewArrivals = async () => {
  const country = await getServerCountry();
  return <CachedNewArrivals country={country} />;
};

export default NewArrivals;

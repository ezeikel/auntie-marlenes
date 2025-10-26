import { searchProducts } from '@/app/actions';
import ProductCard from './ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const BundleDeals = async () => {
  // Get products on sale (with compareAtPrice)
  const saleProducts = await searchProducts({
    onSale: true,
    first: 6,
  });

  // If no sale products, get first 6 products
  const bundleProducts =
    saleProducts.length > 0 ? saleProducts : await searchProducts({ first: 6 });

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4 uppercase">
            Bundle Deals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Save more when you bundle! Get complete hair care routines at
            amazing prices.
          </p>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-6">
            {bundleProducts.map((product) => {
              const discountPercent = product.compareAtPrice
                ? Math.round(
                    ((product.compareAtPrice - product.price) /
                      product.compareAtPrice) *
                      100,
                  )
                : 0;

              return (
                <CarouselItem
                  key={product.id}
                  className="pl-6 basis-4/5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="relative">
                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-2 left-2 z-10 bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-full">
                        Save {discountPercent}%
                      </div>
                    )}
                    <ProductCard product={product} />
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex left-4" />
          <CarouselNext className="hidden sm:flex right-4" />
        </Carousel>

        <div className="text-center mt-8">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-transparent border-2 border-cocoa"
          >
            <Link href="/sale">View All Sale Items</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BundleDeals;

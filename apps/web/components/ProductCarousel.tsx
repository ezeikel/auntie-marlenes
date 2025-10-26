import { getProducts } from '@/app/actions';
import ProductCard from './ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const ProductCarousel = async () => {
  const products = await getProducts();

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center text-cocoa">
          Featured Products
        </h2>
        <div className="mt-12">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {products.map((product, index) => (
                <CarouselItem
                  key={index}
                  className="pl-6 basis-4/5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <div className="h-full">
                    <ProductCard product={product} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex left-4" />
            <CarouselNext className="hidden sm:flex right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;

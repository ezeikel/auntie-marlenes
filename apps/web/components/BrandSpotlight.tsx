import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type FeaturedBrand = {
  name: string;
  description: string;
  image: string;
  href: string;
  bgColor: string;
};

const featuredBrands: FeaturedBrand[] = [
  {
    name: 'Camille Rose',
    description:
      "Nourish your natural beauty with Camille Rose—a luxurious blend of nature's finest ingredients.",
    image: '/placeholder.svg?height=400&width=600&text=Camille+Rose',
    href: '/brands/camille-rose',
    bgColor: 'bg-gradient-to-br from-pink-200 to-pink-300',
  },
  {
    name: 'Mielle Organics',
    description:
      'Discover healthier ingredients with Mielle Organics—premium natural haircare for every texture.',
    image: '/placeholder.svg?height=400&width=600&text=Mielle+Organics',
    href: '/brands/mielle-organics',
    bgColor: 'bg-gradient-to-br from-sage-green/20 to-sage-green/30',
  },
  {
    name: 'The Doux',
    description:
      'Turn up the volume with The Doux—a bold, stylist-crafted line for confident, carefree curls.',
    image: '/placeholder.svg?height=400&width=600&text=The+Doux',
    href: '/brands/the-doux',
    bgColor: 'bg-gradient-to-br from-cyan-200 to-cyan-300',
  },
];

const BrandSpotlight = () => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4">
            Brand Spotlight
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the brands we love—handpicked for quality, authenticity,
            and results you can see and feel.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {featuredBrands.map((brand) => (
            <div
              key={brand.name}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className={`${brand.bgColor} p-8 h-full flex flex-col`}>
                <div className="relative h-64 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src={brand.image || '/placeholder.svg'}
                    alt={brand.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-2xl font-playfair font-bold text-cocoa mb-3">
                  {brand.name}
                </h3>
                <p className="text-gray-700 mb-6 flex-grow">
                  {brand.description}
                </p>
                <Button
                  asChild
                  className="w-full bg-cocoa hover:bg-cocoa/90 text-white"
                >
                  <Link href={brand.href}>Shop {brand.name}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandSpotlight;

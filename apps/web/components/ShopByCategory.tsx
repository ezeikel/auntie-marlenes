import Image from 'next/image';
import Link from 'next/link';

type Category = {
  name: string;
  href: string;
  image: string;
};

const categories: Category[] = [
  {
    name: 'Women',
    href: '/women',
    image: '/images/categories/women.png',
  },
  {
    name: 'Men',
    href: '/men',
    image: '/images/categories/men.png',
  },
  {
    name: 'Kids',
    href: '/kids',
    image: '/images/categories/kids.png',
  },
  {
    name: 'Accessories',
    href: '/accessories',
    image: '/images/categories/accessories.png',
  },
];

const ShopByCategory = () => (
  <section className="py-16 sm:py-24 bg-warm-beige">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center text-cocoa mb-12 uppercase">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group relative aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <Image
              src={category.image || '/placeholder.svg'}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/90 via-cocoa/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl md:text-3xl font-playfair font-bold text-white">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default ShopByCategory;

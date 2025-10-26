import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/pro-regular-svg-icons';

type EmptyCategoryProps = {
  categoryName: string;
};

export default function EmptyCategory({ categoryName }: EmptyCategoryProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-warm-beige flex items-center justify-center">
          <FontAwesomeIcon icon={faBoxOpen} className="text-cocoa" size="3x" />
        </div>

        <h2 className="text-3xl font-playfair font-bold text-cocoa mb-4">
          {categoryName} Coming Soon
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          We're currently curating the perfect selection of{' '}
          {categoryName.toLowerCase()} products for you. Check back soon or
          explore our other collections.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-sage-green hover:bg-sage-green/90 text-white font-bold"
          >
            <Link href="/shop">Shop All Products</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-transparent border-2 border-cocoa font-semibold"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/pro-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/pro-regular-svg-icons';
import type { Product } from '@/lib/constants';
import { formatCurrency } from '@/lib/currency';
import { useSaved } from '@/contexts/SavedContext';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { isSaved: checkIsSaved, toggleSave } = useSaved();
  const productIsSaved = checkIsSaved(product.id);

  return (
    <div className="group relative">
      <Link
        href={`/product/${encodeURIComponent(product.id)}`}
        className="block"
      >
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-3">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-warm-beige/95 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-inter text-gray-500">{product.brand}</p>
          <h3 className="text-sm font-inter font-medium text-cocoa line-clamp-2 group-hover:underline">
            {product.name}
          </h3>
          <p className="text-base font-semibold text-cocoa">
            {formatCurrency(product.price, 'GBP')}
          </p>
          {product.colors && product.colors.length > 1 && (
            <p className="text-xs text-gray-500">
              {product.colors.length} colours
            </p>
          )}
        </div>
      </Link>

      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-10 w-10 rounded-full bg-white hover:bg-white shadow-md"
        onClick={(e) => {
          e.preventDefault();
          toggleSave(product.id);
        }}
      >
        <FontAwesomeIcon
          icon={productIsSaved ? faHeartSolid : faHeartRegular}
          className="text-gray-600"
        />
        <span className="sr-only">Save to wishlist</span>
      </Button>
    </div>
  );
};

export default ProductCard;

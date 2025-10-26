import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/constants';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
  className?: string;
};

const ProductCard = ({ product, className }: ProductCardProps) => {
  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all hover:shadow-lg',
        className,
      )}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-warm-beige">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!product.inStock && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-destructive text-destructive-foreground"
            >
              Out of Stock
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Brand */}
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.brand}
          </p>

          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300',
                    )}
                  />
                ))}
              </div>
              {product.reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1" disabled={!product.inStock} size="sm">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Add to Bag
        </Button>
        <Button variant="outline" size="icon" className="shrink-0">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Save</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

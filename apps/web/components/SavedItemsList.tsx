'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faTrash,
  faHeart,
} from '@fortawesome/pro-regular-svg-icons';
import { formatCurrency } from '@/lib/currency';
import { useSaved } from '@/contexts/SavedContext';
import { getProduct } from '@/app/actions';
import AddToBagButton from './buttons/AddToBagButton/AddToBagButton';

type SortOption = {
  value: string;
  label: string;
};

const sortOptions: SortOption[] = [
  { value: 'recently-added', label: 'Recently added' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'brand-az', label: 'Brand A-Z' },
  { value: 'brand-za', label: 'Brand Z-A' },
];

export default function SavedItemsList() {
  const { savedItems: savedProductIds, toggleSave } = useSaved();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recently-added');

  // Fetch product details for all saved product IDs
  useEffect(() => {
    const fetchProducts = async () => {
      if (savedProductIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch all products in parallel
        const productPromises = savedProductIds.map((id) =>
          getProduct({ productId: id }).catch(() => null),
        );
        const fetchedProducts = await Promise.all(productPromises);

        // Filter out any failed fetches (null)
        setProducts(fetchedProducts.filter((p): p is Product => p !== null));
      } catch (error) {
        console.error('Failed to fetch saved products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [savedProductIds]);

  const handleRemoveItem = (productId: string) => {
    toggleSave(productId);
  };

  const handleAddedToBag = (productId: string) => {
    // Remove from saved after successfully adding to bag
    toggleSave(productId);
  };

  const sortedItems = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'brand-az':
        return a.brand.localeCompare(b.brand);
      case 'brand-za':
        return b.brand.localeCompare(a.brand);
      default:
        return 0; // recently-added (keep original order)
    }
  });

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-green/10 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faHeart}
            className="text-sage-green animate-pulse"
            size="2x"
          />
        </div>
        <p className="text-gray-600">Loading your saved items...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-green/10 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faHeart}
            className="text-sage-green"
            size="2x"
          />
        </div>
        <h2 className="text-2xl font-playfair font-bold text-cocoa mb-3">
          You have no Saved Items
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Start saving as you shop by selecting the little heart icon on
          products. We'll keep them here for you to review later!
        </p>
        <Button
          asChild
          size="lg"
          className="bg-sage-green hover:bg-sage-green/90 text-white font-bold"
        >
          <Link href="/search">START SHOPPING</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Saved Items Grid */}
      <div className="max-w-7xl mx-auto">
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white">
                  <span className="font-semibold">
                    {sortOptions.find((opt) => opt.value === sortBy)?.label}
                  </span>
                  <FontAwesomeIcon icon={faChevronDown} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={
                      sortBy === option.value ? 'bg-sage-green/10' : ''
                    }
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm font-inter text-gray-600">
            <span className="font-semibold text-cocoa">{products.length}</span>{' '}
            {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="relative aspect-square group">
                <Link href={`/product/${item.id}`}>
                  <Image
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-10 w-10 rounded-full bg-white hover:bg-red-50 shadow-md"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-gray-600 hover:text-red-600"
                  />
                  <span className="sr-only">Remove from saved items</span>
                </Button>
                {!item.inStock && (
                  <div className="absolute inset-0 bg-warm-beige/95 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-inter text-gray-500 uppercase mb-1">
                    {item.brand}
                  </p>
                  <Link
                    href={`/product/${item.id}`}
                    className="text-sm font-inter font-medium text-cocoa hover:text-terracotta line-clamp-2 transition-colors"
                  >
                    {item.name}
                  </Link>
                </div>

                <p className="text-lg font-bold text-cocoa">
                  {formatCurrency(item.price, 'GBP')}
                </p>

                {/* Color Options */}
                {item.colors && item.colors.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                      {item.colors.length > 1
                        ? `${item.colors.length} colours`
                        : '1 colour'}
                    </p>
                    <div className="flex gap-2">
                      {item.colors.slice(0, 5).map((color) => (
                        <button
                          key={color.name}
                          className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-cocoa transition-colors"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Move to Bag Button */}
                {item.inStock ? (
                  <AddToBagButton
                    productId={item.id}
                    buttonText="MOVE TO BAG"
                    buttonClassName="w-full bg-white border-2 border-sage-green text-sage-green hover:bg-sage-green hover:text-white font-bold transition-all"
                    onSuccess={() => handleAddedToBag(item.id)}
                  />
                ) : (
                  <Button
                    className="w-full bg-white border-2 border-gray-300 text-gray-400 font-bold"
                    disabled
                  >
                    OUT OF STOCK
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-transparent border-2 border-cocoa"
          >
            <Link href="/search">Continue Shopping</Link>
          </Button>
        </div>
      </div>

      {/* Benefits Banner */}
      {products.length > 0 && (
        <div className="mt-16 bg-gradient-to-r from-sage-green to-warm-clay rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold mb-4">
            Ready to Complete Your Order?
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Free UK delivery on orders over £40 • Easy returns • Earn points
            with every purchase
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-sage-green hover:bg-warm-beige font-bold"
          >
            <Link href="/bag">View Shopping Bag</Link>
          </Button>
        </div>
      )}
    </>
  );
}

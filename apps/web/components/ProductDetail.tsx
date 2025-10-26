'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart as faHeartRegular,
  faTruck,
  faRotateLeft,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/pro-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/pro-solid-svg-icons';
import type { Product } from '@/lib/constants';
import { formatCurrency } from '@/lib/currency';
import ProductCard from './ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import AddToBagButton from './buttons/AddToBagButton/AddToBagButton';
import { useSaved } from '@/contexts/SavedContext';

type ProductDetailProps = {
  product: Product;
  relatedProducts?: Product[];
  sanitizedDescription: string;
};

const ProductDetail = ({
  product,
  relatedProducts = [],
  sanitizedDescription,
}: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const { isSaved, toggleSave } = useSaved();

  const images = product.images || [product.image];
  const productIsSaved = isSaved(product.id);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm font-inter text-gray-600">
            <Link href="/" className="hover:text-cocoa">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/search" className="hover:text-cocoa">
              Search results
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Thumbnail Navigation - Desktop */}
            <div className="hidden lg:flex gap-4">
              <div className="flex flex-col gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx
                        ? 'border-cocoa'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img || '/placeholder.svg'}
                      alt={`${product.name} ${idx + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
                <Image
                  src={images[selectedImage] || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 right-4 bg-cocoa/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-white flex items-center gap-1.5 shadow-lg">
                  <span>{product.saveCount || 0}</span>
                  <FontAwesomeIcon
                    icon={faHeartSolid}
                    className="text-white"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Image Carousel */}
            <div className="lg:hidden relative">
              <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
                <Image
                  src={images[selectedImage] || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} size="sm" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
                    >
                      <FontAwesomeIcon icon={faChevronRight} size="sm" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-2 rounded-full transition-all ${
                      selectedImage === idx ? 'w-8 bg-cocoa' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-inter text-gray-600 mb-2">
                {product.brand}
              </p>
              <h1 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-cocoa">
                {formatCurrency(product.price, 'GBP')}
              </p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  COLOUR:{' '}
                  <span className="font-normal">{selectedColor?.name}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedColor?.name === color.name
                          ? 'border-cocoa'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: color.value }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  SIZE: <span className="font-normal">{selectedSize}</span>
                </p>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-lg border-2 transition-colors font-medium ${
                        selectedSize === size
                          ? 'border-cocoa bg-cocoa text-white'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Bag */}
            <div className="flex gap-3">
              <div className="flex-1">
                <AddToBagButton
                  productId={product.id}
                  selectedOptions={{
                    ...(selectedColor && { Color: selectedColor.name }),
                    ...(selectedSize && { Size: selectedSize }),
                  }}
                />
              </div>
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-14 rounded-lg bg-transparent"
                onClick={() => toggleSave(product.id)}
              >
                <FontAwesomeIcon
                  icon={productIsSaved ? faHeartSolid : faHeartRegular}
                  size="lg"
                />
                <span className="sr-only">Save</span>
              </Button>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="text-gray-600">
                Sold by{' '}
                <span className="font-semibold text-gray-900">
                  {product.brand}
                </span>
                , shipped by{' '}
                <span className="font-semibold text-gray-900">
                  Auntie Marlene's
                </span>
              </p>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faTruck}
                  className="text-gray-600 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    Free delivery on qualifying orders
                  </p>
                  <p className="text-sm text-gray-600">Orders over £40</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faRotateLeft}
                  className="text-gray-600 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    Free returns on qualifying orders
                  </p>
                  <Link
                    href="/returns"
                    className="text-sm text-gray-600 underline hover:no-underline"
                  >
                    View our Delivery & Returns Policy
                  </Link>
                </div>
              </div>
            </div>

            {/* Product Details Accordions */}
            <Accordion
              type="single"
              collapsible
              className="border-t border-gray-200"
            >
              <AccordionItem value="details">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  Product Details
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 prose prose-sm max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brand">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  Brand
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  <p className="font-semibold text-gray-900 mb-2">
                    {product.brand}
                  </p>
                  <p>
                    {product.brand} is committed to creating high-quality hair
                    care products specifically designed for textured hair. All
                    products are made with natural ingredients.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  Look After Me
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  <ul className="space-y-2">
                    <li>Store in a cool, dry place</li>
                    <li>Keep away from direct sunlight</li>
                    <li>Close lid tightly after use</li>
                    <li>For external use only</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="about">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  About Me
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  <p>Category: {product.category}</p>
                  <p className="mt-2">
                    Perfect for daily use on natural, relaxed, or transitioning
                    hair.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* You Might Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-playfair font-bold text-cocoa mb-8 uppercase">
              You Might Also Like
            </h2>
            <Carousel
              opts={{
                align: 'start',
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {relatedProducts.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4" />
              <CarouselNext className="hidden md:flex -right-4" />
            </Carousel>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;

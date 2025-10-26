'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMinus, faPlus } from '@fortawesome/pro-regular-svg-icons';
import { formatCurrency } from '@/lib/currency';

type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: {
      amount: string;
      currencyCode: string;
    };
    image?: {
      url: string;
      altText?: string;
    };
    product: {
      id: string;
      title: string;
      vendor: string;
      images?: {
        edges: Array<{
          node: {
            url: string;
            altText?: string;
          };
        }>;
      };
    };
  };
};

type BagPopoverProps = {
  cartId: string;
  lines: CartLine[];
  subtotal: number;
  checkoutUrl?: string;
  onClose: () => void;
  onUpdateQuantity: (lineId: string, newQuantity: number) => Promise<void>;
  onRemoveItem: (lineId: string) => Promise<void>;
};

const BagPopover = ({
  cartId,
  lines,
  subtotal,
  checkoutUrl,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
}: BagPopoverProps) => {
  const totalItems = lines.reduce((acc, line) => acc + line.quantity, 0);

  return (
    <div className="w-[380px] bg-white rounded-lg shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-playfair font-bold text-lg text-cocoa">
          My Bag, {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Items */}
      <div className="max-h-[400px] overflow-y-auto">
        {lines.map((line) => {
          const price = parseFloat(line.merchandise.priceV2.amount);
          const imageUrl =
            line.merchandise.image?.url ||
            line.merchandise.product.images?.edges[0]?.node.url ||
            '/placeholder.svg';

          return (
            <div key={line.id} className="p-4 border-b border-gray-100">
              <div className="flex gap-3">
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={line.merchandise.product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-cocoa line-clamp-2 leading-tight">
                      {line.merchandise.product.title}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(line.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      aria-label="Remove item"
                    >
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mb-1">
                    {line.merchandise.product.vendor}
                  </p>

                  {line.merchandise.title !== 'Default Title' && (
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">Variant:</span>{' '}
                      {line.merchandise.title}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(line.id, line.quantity - 1)
                        }
                        className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <FontAwesomeIcon icon={faMinus} size="xs" />
                      </button>
                      <span className="text-sm font-medium text-gray-900 w-8 text-center">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(line.id, line.quantity + 1)
                        }
                        className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <FontAwesomeIcon icon={faPlus} size="xs" />
                      </button>
                    </div>
                    <p className="text-base font-bold text-cocoa">
                      {formatCurrency(price * line.quantity, 'GBP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700">Sub-total</span>
          <span className="font-bold text-lg text-cocoa">
            {formatCurrency(subtotal, 'GBP')}
          </span>
        </div>

        <div className="space-y-2">
          <Button
            asChild
            className="w-full bg-white border-2 border-cocoa text-cocoa hover:bg-cocoa hover:text-white font-bold"
          >
            <Link href="/bag" onClick={onClose}>
              VIEW BAG
            </Link>
          </Button>

          <Button
            onClick={() => {
              if (checkoutUrl) {
                window.location.href = checkoutUrl;
              }
            }}
            className="w-full bg-sage-green hover:bg-sage-green/90 text-white font-bold"
          >
            CHECKOUT
          </Button>
        </div>

        <p className="text-xs text-center text-gray-600">
          Free UK Delivery on orders over £40{' '}
          <Link
            href="/delivery"
            className="underline hover:no-underline text-sage-green"
          >
            More info
          </Link>
        </p>
      </div>
    </div>
  );
};

export default BagPopover;

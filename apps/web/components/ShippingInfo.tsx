import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck } from '@fortawesome/pro-regular-svg-icons';
import type { ShippingZone } from '@/lib/location';
import {
  ukShipping,
  usShipping,
  uaeShipping,
  euShipping,
  rowShipping,
  getNextDayCutoffTime,
  isNextDayAvailable,
} from '@/config/shipping';
import { formatCurrency } from '@/lib/currency';

type ShippingInfoProps = {
  zone: ShippingZone;
  variant?: 'detailed' | 'compact';
  className?: string;
};

export const ShippingInfo = ({
  zone,
  variant = 'detailed',
  className = '',
}: ShippingInfoProps) => {
  if (variant === 'compact') {
    return (
      <div className={className}>
        {zone === 'UK' ? (
          <p className="text-sm text-gray-700">
            Free UK delivery over {formatCurrency(ukShipping.freeDeliveryThreshold, 'GBP')}
          </p>
        ) : zone === 'US' ? (
          <p className="text-sm text-gray-700">We ship to the USA</p>
        ) : zone === 'UAE' ? (
          <p className="text-sm text-gray-700">We ship to the UAE</p>
        ) : (
          <p className="text-sm text-gray-700">Worldwide shipping available</p>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={`bg-sage-green/5 border border-sage-green/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <FontAwesomeIcon icon={faTruck} className="text-sage-green mt-1" size="lg" />
        <div className="flex-1">
          {zone === 'UK' ? (
            <>
              <h3 className="font-semibold text-cocoa mb-1">
                FREE STANDARD DELIVERY
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                On all UK orders over {formatCurrency(ukShipping.freeDeliveryThreshold, 'GBP')}.
                Orders under this amount will be charged {formatCurrency(ukShipping.standardDeliveryFee, 'GBP')}.
              </p>
              <div className="bg-white/60 border border-sage-green/10 rounded-lg p-3 mt-2">
                <h4 className="font-semibold text-sm text-cocoa mb-1">
                  Next-Day Delivery Available
                </h4>
                <p className="text-sm text-gray-700">
                  {isNextDayAvailable() ? (
                    <>
                      Order within the next few hours for next-day delivery
                      ({formatCurrency(ukShipping.nextDayDeliveryFee, 'GBP')}).
                      Order before {getNextDayCutoffTime()} for next-day delivery.
                    </>
                  ) : (
                    <>
                      Next-day delivery available ({formatCurrency(ukShipping.nextDayDeliveryFee, 'GBP')})
                      on orders placed before {getNextDayCutoffTime()}.
                    </>
                  )}
                </p>
              </div>
            </>
          ) : zone === 'US' ? (
            <>
              <h3 className="font-semibold text-cocoa mb-1">
                WE SHIP TO THE USA
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                International shipping available. Minimum order: {formatCurrency(usShipping.minimumOrder, 'GBP')}.
              </p>
              <p className="text-sm text-gray-600">
                Estimated delivery: {usShipping.estimatedDeliveryDays.min}-
                {usShipping.estimatedDeliveryDays.max} business days.
                Shipping costs calculated at checkout.
              </p>
            </>
          ) : zone === 'UAE' ? (
            <>
              <h3 className="font-semibold text-cocoa mb-1">
                WE SHIP TO THE UAE
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                Get the products you love from home delivered to Dubai & beyond.
                Minimum order: {formatCurrency(uaeShipping.minimumOrder, 'GBP')}.
              </p>
              <p className="text-sm text-gray-600">
                Estimated delivery: {uaeShipping.estimatedDeliveryDays.min}-
                {uaeShipping.estimatedDeliveryDays.max} business days.
                Shipping costs calculated at checkout.
              </p>
            </>
          ) : zone === 'EU' ? (
            <>
              <h3 className="font-semibold text-cocoa mb-1">
                EUROPEAN SHIPPING AVAILABLE
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                We ship across Europe. Minimum order: {formatCurrency(euShipping.minimumOrder, 'GBP')}.
              </p>
              <p className="text-sm text-gray-600">
                Estimated delivery: {euShipping.estimatedDeliveryDays.min}-
                {euShipping.estimatedDeliveryDays.max} business days.
                Shipping costs calculated at checkout.
              </p>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-cocoa mb-1">
                WORLDWIDE SHIPPING
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                We ship globally. Minimum order: {formatCurrency(rowShipping.minimumOrder, 'GBP')}.
              </p>
              <p className="text-sm text-gray-600">
                Estimated delivery: {rowShipping.estimatedDeliveryDays.min}-
                {rowShipping.estimatedDeliveryDays.max} business days.
                Shipping costs calculated at checkout.
              </p>
            </>
          )}
          <Link
            href="/delivery-returns"
            className="text-sm text-sage-green font-semibold hover:underline mt-2 inline-block"
          >
            More info
          </Link>
        </div>
      </div>
    </div>
  );
};

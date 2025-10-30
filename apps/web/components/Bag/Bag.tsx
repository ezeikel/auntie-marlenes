import Link from 'next/link';
import { getCart, searchProducts } from '@/app/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faShieldHalved,
  faGift,
  faShoppingBag,
} from '@fortawesome/pro-regular-svg-icons';
import BagClient from '@/components/BagClient';

const Bag = async () => {
  const cart = await getCart();

  // Get recommended products
  const allProducts = await searchProducts({ first: 12 });

  // Filter out products that are already in cart
  const cartProductIds =
    cart?.lines.edges.map((edge: any) => edge.node.merchandise.product.id) ||
    [];
  const recommendedProducts = allProducts
    .filter((p) => !cartProductIds.includes(p.id))
    .slice(0, 6);

  // Calculate cart totals
  const subtotal = cart?.cost.subtotalAmount
    ? parseFloat(cart.cost.subtotalAmount.amount)
    : 0;
  const deliveryFee = subtotal >= 40 ? 0 : 3.95;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-warm-beige min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {!cart || cart.lines.edges.length === 0 ? (
          /* Empty Bag State */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-warm-beige flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  className="text-cocoa"
                  size="3x"
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4">
                Your bag is empty
              </h1>

              <p className="text-gray-600 mb-2 leading-relaxed">
                Items remain in your bag for 60 minutes, and then they're moved
                to your Saved Items.
              </p>

              <div className="mt-8 space-y-3">
                <Link
                  href="/shop"
                  className="inline-block px-8 py-3 bg-sage-green hover:bg-sage-green/90 text-white font-bold rounded-md transition-colors"
                >
                  CONTINUE SHOPPING
                </Link>
              </div>
            </div>

            {/* Why Shop With Us */}
            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-sage-green/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faTruck}
                    className="text-sage-green"
                    size="2x"
                  />
                </div>
                <h3 className="font-semibold text-cocoa mb-1">Free Delivery</h3>
                <p className="text-sm text-gray-600">On orders over £40</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-terracotta/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faShieldHalved}
                    className="text-terracotta"
                    size="2x"
                  />
                </div>
                <h3 className="font-semibold text-cocoa mb-1">
                  Secure Shopping
                </h3>
                <p className="text-sm text-gray-600">
                  Safe & encrypted payments
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-warm-clay/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faGift}
                    className="text-warm-clay"
                    size="2x"
                  />
                </div>
                <h3 className="font-semibold text-cocoa mb-1">
                  Auntie's Rewards
                </h3>
                <p className="text-sm text-gray-600">
                  Earn points on every purchase
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Filled Bag - Client Component handles interactions */
          <BagClient
            cart={cart}
            recommendedProducts={recommendedProducts}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
          />
        )}
      </div>
    </div>
  );
};

export default Bag;

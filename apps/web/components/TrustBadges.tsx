import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faBox,
  faGift,
  faShieldHalved,
} from '@fortawesome/pro-regular-svg-icons';

type TrustBadge = {
  icon: typeof faTruck;
  title: string;
  description: string;
};

const badges: TrustBadge[] = [
  {
    icon: faTruck,
    title: 'Free UK Delivery',
    description: 'On orders over £40',
  },
  {
    icon: faBox,
    title: 'Over 3000+ Products',
    description: 'From trusted brands',
  },
  {
    icon: faGift,
    title: "Auntie's Rewards",
    description: 'Earn points on every purchase',
  },
  {
    icon: faShieldHalved,
    title: 'Secure Checkout',
    description: 'Safe & encrypted payments',
  },
];

const TrustBadges = () => {
  return (
    <section className="py-12 bg-white border-y border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-sage-green/10 flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={badge.icon}
                  className="text-sage-green"
                  size="2x"
                />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-cocoa mb-1">
                {badge.title}
              </h3>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;

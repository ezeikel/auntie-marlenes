import { faHeart, faUser } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Bag from '@/components/Bag/Bag';

export const NAVIGATION_ITEMS = [
  {
    id: '1',
    label: 'Account',
    component: (
      <FontAwesomeIcon icon={faUser} size="xl" className="text-black" />
    ),
    href: '/account',
  },
  {
    id: '2',
    label: 'Saved',
    component: (
      <FontAwesomeIcon icon={faHeart} size="xl" className="text-black" />
    ),
    href: '/saved',
  },
  {
    id: '3',
    label: 'Bag',
    component: <Bag />,
    href: '/bag',
  },
];

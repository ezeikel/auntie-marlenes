import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag } from '@fortawesome/pro-regular-svg-icons';

export default function BagSkeleton() {
  return (
    <div className="relative">
      <FontAwesomeIcon
        icon={faShoppingBag}
        size="lg"
        className="text-gray-400 animate-pulse"
      />
      <span className="sr-only">Loading bag...</span>
    </div>
  );
}

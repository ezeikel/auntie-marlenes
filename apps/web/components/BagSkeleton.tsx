import { faShoppingBag } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

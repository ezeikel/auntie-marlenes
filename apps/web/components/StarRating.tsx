import { faStar as faStarRegular } from '@fortawesome/pro-regular-svg-icons';
import {
  faStarHalfStroke,
  faStar as faStarSolid,
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export default function StarRating({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
}: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FontAwesomeIcon
        key={`full-${i}`}
        icon={faStarSolid}
        className="text-warm-clay"
      />,
    );
  }

  if (hasHalfStar) {
    stars.push(
      <FontAwesomeIcon
        key="half"
        icon={faStarHalfStroke}
        className="text-warm-clay"
      />,
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <FontAwesomeIcon
        key={`empty-${i}`}
        icon={faStarRegular}
        className="text-warm-clay/40"
      />,
    );
  }

  const sizeClasses = size === 'sm' ? 'text-xs gap-0.5' : 'text-sm gap-1';
  const countClasses = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <div className={`flex items-center ${sizeClasses}`}>
      <div className="flex">{stars}</div>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className={`${countClasses} text-gray-500 ml-1`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

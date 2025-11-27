import type { ShippingZone } from '@/lib/location';

export type ShippingConfig = {
  freeDeliveryThreshold: number; // in GBP
  standardDeliveryFee: number; // in GBP
  nextDayDeliveryFee: number; // in GBP
  nextDayCutoffHour: number; // 24-hour format
  nextDayCutoffMinute: number;
};

export type InternationalShippingConfig = {
  minimumOrder: number; // in GBP
  estimatedDeliveryDays: {
    min: number;
    max: number;
  };
};

// UK Shipping Configuration
export const ukShipping: ShippingConfig = {
  freeDeliveryThreshold: 40, // Free delivery over £40
  standardDeliveryFee: 3.95, // £3.95 standard delivery fee
  nextDayDeliveryFee: 5.95, // TODO: Confirm Royal Mail next-day delivery cost
  nextDayCutoffHour: 14, // 2pm cutoff
  nextDayCutoffMinute: 0,
};

// US Shipping Configuration
export const usShipping: InternationalShippingConfig = {
  minimumOrder: 30, // TODO: Set appropriate minimum order for US
  estimatedDeliveryDays: {
    min: 7,
    max: 14,
  },
};

// UAE Shipping Configuration
export const uaeShipping: InternationalShippingConfig = {
  minimumOrder: 30, // TODO: Set appropriate minimum order for UAE
  estimatedDeliveryDays: {
    min: 5,
    max: 10,
  },
};

// EU Shipping Configuration
export const euShipping: InternationalShippingConfig = {
  minimumOrder: 25, // TODO: Set appropriate minimum order for EU
  estimatedDeliveryDays: {
    min: 5,
    max: 10,
  },
};

// Rest of World Shipping Configuration
export const rowShipping: InternationalShippingConfig = {
  minimumOrder: 35, // TODO: Set appropriate minimum order for ROW
  estimatedDeliveryDays: {
    min: 10,
    max: 21,
  },
};

// Get shipping config by zone
export const getShippingConfig = (zone: ShippingZone) => {
  switch (zone) {
    case 'UK':
      return ukShipping;
    case 'US':
      return usShipping;
    case 'UAE':
      return uaeShipping;
    case 'EU':
      return euShipping;
    case 'ROW':
      return rowShipping;
    default:
      return rowShipping;
  }
};

// Check if next-day delivery is available (UK only, order before cutoff time)
export const isNextDayAvailable = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const cutoffTime =
    ukShipping.nextDayCutoffHour * 60 + ukShipping.nextDayCutoffMinute;
  const currentTime = currentHour * 60 + currentMinute;

  return currentTime < cutoffTime;
};

// Get next-day cutoff time as formatted string
export const getNextDayCutoffTime = (): string => {
  const hour = ukShipping.nextDayCutoffHour;
  const minute = ukShipping.nextDayCutoffMinute;

  const period = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');

  return `${displayHour}:${displayMinute}${period}`;
};

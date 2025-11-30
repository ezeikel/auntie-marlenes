'use client';

import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/utils/analytics-client';
import { TRACKING_EVENTS } from '@/constants/events';

type CheckoutButtonProps = {
  url: string;
};

const CheckoutButton = ({ url }: CheckoutButtonProps) => {
  const { track } = useAnalytics();

  return (
    <Button
      onClick={() => {
        // Track checkout started event - critical conversion funnel event
        track(TRACKING_EVENTS.CHECKOUT_STARTED, {
          checkout_url: url,
        });

        // redirect to shopify checkout
        window.location.href = url;
      }}
    >
      Checkout
    </Button>
  );
};

export default CheckoutButton;

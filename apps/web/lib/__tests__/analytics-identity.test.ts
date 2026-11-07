import { describe, expect, it, vi } from 'vitest';

vi.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
vi.mock('posthog-js', () => ({ default: {} }));
vi.mock('@/utils/facebook-pixel', () => ({
  trackAddToCart: vi.fn(),
  trackFacebookPixelCustomEvent: vi.fn(),
  trackInitiateCheckout: vi.fn(),
  trackSearch: vi.fn(),
  trackViewContent: vi.fn(),
}));

const { sessionAnalyticsIdentity } = await import('@/utils/analytics-client');

describe('sessionAnalyticsIdentity', () => {
  it('identifies a signed-in user by the session user id, as the server tracker does', () => {
    // The exact public session shape auth.ts returns.
    expect(
      sessionAnalyticsIdentity({
        id: 'user-1',
        name: 'Synthetic Shopper',
        email: 'shopper@example.test',
        image: null,
      }),
    ).toEqual({
      userId: 'user-1',
      userProperties: {
        email: 'shopper@example.test',
        name: 'Synthetic Shopper',
      },
    });
  });

  it('has no identity when signed out', () => {
    expect(sessionAnalyticsIdentity(undefined)).toEqual({
      userId: undefined,
      userProperties: undefined,
    });
  });
});

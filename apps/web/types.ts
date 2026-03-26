import type { User } from '@auntie-marlenes/db';
import { TRACKING_EVENTS } from '@/constants/events';

export enum SignInMethod {
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
  MAGIC_LINK = 'magic_link',
}

type ImageEdge = {
  node: {
    originalSrc: string;
  };
};

type ProductNode = {
  id: string;
  title: string;
  description: string;
  images: {
    edges: ImageEdge[];
  };
};

export type ProductEdge = {
  node: ProductNode;
};

export type CurrentUser = Pick<User, 'id' | 'name' | 'email'>;

export type TrackingEvent =
  (typeof TRACKING_EVENTS)[keyof typeof TRACKING_EVENTS];

// Event property types for type safety
export type BaseEventProperties = {
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  url?: string;
  userAgent?: string;
};

// For strongly-typed analytics events
export type EventProperties = {
  // Cart Events
  [TRACKING_EVENTS.CART_CREATED]: {
    cart_id: string;
    product_variant_id: string;
    country_code: string;
    source: string;
  };
  [TRACKING_EVENTS.CART_VIEWED]: {
    cart_id: string;
    item_count: number;
    cart_value: number;
    currency: string;
  };
  [TRACKING_EVENTS.CART_QUANTITY_UPDATED]: {
    cart_id: string;
    line_id: string;
    quantity: number;
    source: string;
  };
  [TRACKING_EVENTS.PRODUCT_ADDED_TO_CART]: {
    cart_id: string;
    product_variant_id: string;
    source: string;
  };
  [TRACKING_EVENTS.PRODUCT_REMOVED_FROM_CART]: {
    cart_id: string;
    line_ids: string[];
    source: string;
  };

  // Product Events
  [TRACKING_EVENTS.PRODUCT_VIEWED]: {
    product_id: string;
    product_name: string;
    product_handle: string;
    product_category?: string;
    product_price?: number;
  };
  [TRACKING_EVENTS.PRODUCT_SHARED]: {
    product_id: string;
    product_name: string;
    product_handle: string;
    share_method: 'native' | 'clipboard';
  };
  [TRACKING_EVENTS.PRODUCT_SHARE_FAILED]: {
    product_id: string;
    product_name: string;
    error_name: string;
    error_message: string;
  };
  [TRACKING_EVENTS.ADD_TO_BAG_CLICKED]: {
    product_id: string;
    selected_options: string;
  };
  [TRACKING_EVENTS.ADD_TO_BAG_FAILED]: {
    product_id: string;
    selected_options: string;
    error: string;
  };
  [TRACKING_EVENTS.PRODUCT_ADDED_TO_BAG]: {
    product_id: string;
    variant_id: string;
    selected_options: string;
    product_name?: string;
    product_price?: number;
  };

  // Save/Wishlist Events
  [TRACKING_EVENTS.PRODUCT_SAVED]: {
    product_id: string;
    user_id?: string;
    is_authenticated?: boolean;
    storage_location?: 'database' | 'local_storage';
    source?: string;
  };
  [TRACKING_EVENTS.PRODUCT_UNSAVED]: {
    product_id: string;
    user_id?: string;
    is_authenticated?: boolean;
    storage_location?: 'database' | 'local_storage';
    source?: string;
  };
  [TRACKING_EVENTS.PRODUCT_SAVE_FAILED]: {
    product_id: string;
    error: string;
  };
  [TRACKING_EVENTS.PRODUCT_UNSAVE_FAILED]: {
    product_id: string;
    error: string;
  };
  [TRACKING_EVENTS.SAVED_ITEMS_SYNCED]: {
    user_id: string;
    product_ids: string[];
    synced_count: number;
    source: string;
  };

  // Search Events
  [TRACKING_EVENTS.SEARCH_SUBMITTED]: {
    search_query: string;
    search_query_length: number;
    search_source: string;
  };
  [TRACKING_EVENTS.SEARCH_RESULTS_LOADED]: {
    search_query: string;
    results_count: number;
    has_results: boolean;
  };
  [TRACKING_EVENTS.PRODUCT_SEARCH]: {
    query: string;
    product_type?: string;
    vendor?: string;
    sort_key?: string;
    reverse?: boolean;
    on_sale?: boolean;
    country_code: string;
    results_count: number;
    source: string;
  };

  // Localization Events
  [TRACKING_EVENTS.COUNTRY_CHANGED]: {
    previous_country: string;
    new_country: string;
    previous_currency: string;
    new_currency: string;
  };
  [TRACKING_EVENTS.CURRENCY_CHANGED]: {
    previous_currency: string;
    new_currency: string;
    country: string;
  };
  [TRACKING_EVENTS.LANGUAGE_CHANGED]: {
    previous_language: string;
    new_language: string;
    previous_language_name: string;
    new_language_name: string;
  };

  // Checkout Events
  [TRACKING_EVENTS.CHECKOUT_STARTED]: {
    cart_id?: string;
    checkout_url?: string;
    item_count?: number;
    cart_value?: number;
    currency?: string;
  };
  [TRACKING_EVENTS.CHECKOUT_COMPLETED]: {
    order_id: string;
    order_name: string;
    total_amount: number;
    currency: string;
    customer_email: string;
    item_count?: number;
  };

  // Quiz Events
  [TRACKING_EVENTS.QUIZ_STARTED]: {
    quiz_type: 'hair_type' | 'skin_type';
  };
  [TRACKING_EVENTS.QUIZ_STEP_COMPLETED]: {
    quiz_type: 'hair_type' | 'skin_type';
    step_number: number;
    step_name: string;
    selected_value: string;
  };
  [TRACKING_EVENTS.QUIZ_COMPLETED]: {
    quiz_type: 'hair_type' | 'skin_type';
    results: Record<string, string>;
  };
  [TRACKING_EVENTS.QUIZ_RESULT_CTA_CLICKED]: {
    quiz_type: 'hair_type' | 'skin_type';
    cta_label: string;
    cta_href: string;
  };

  // Newsletter Events
  [TRACKING_EVENTS.NEWSLETTER_SUBSCRIBED]: {
    email_domain: string;
    source: string;
  };
};

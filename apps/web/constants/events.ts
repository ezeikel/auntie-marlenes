export const TRACKING_EVENTS = {
  // Cart Events
  CART_CREATED: 'cart_created',
  CART_VIEWED: 'cart_viewed',
  CART_QUANTITY_UPDATED: 'cart_quantity_updated',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  PRODUCT_REMOVED_FROM_CART: 'product_removed_from_cart',

  // Product Events
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_SHARED: 'product_shared',
  PRODUCT_SHARE_FAILED: 'product_share_failed',
  ADD_TO_BAG_CLICKED: 'add_to_bag_clicked',
  ADD_TO_BAG_FAILED: 'add_to_bag_failed',
  PRODUCT_ADDED_TO_BAG: 'product_added_to_bag',

  // Save/Wishlist Events
  PRODUCT_SAVED: 'product_saved',
  PRODUCT_UNSAVED: 'product_unsaved',
  PRODUCT_SAVE_FAILED: 'product_save_failed',
  PRODUCT_UNSAVE_FAILED: 'product_unsave_failed',
  SAVED_ITEMS_SYNCED: 'saved_items_synced',

  // Search Events
  SEARCH_SUBMITTED: 'search_submitted',
  SEARCH_RESULTS_LOADED: 'search_results_loaded',
  PRODUCT_SEARCH: 'product_search',

  // Localization Events
  COUNTRY_CHANGED: 'country_changed',
  CURRENCY_CHANGED: 'currency_changed',
  LANGUAGE_CHANGED: 'language_changed',

  // Checkout Events
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',

  // Quiz Events
  QUIZ_STARTED: 'quiz_started',
  QUIZ_STEP_COMPLETED: 'quiz_step_completed',
  QUIZ_COMPLETED: 'quiz_completed',
  QUIZ_RESULT_CTA_CLICKED: 'quiz_result_cta_clicked',

  // Newsletter Events
  NEWSLETTER_SUBSCRIBED: 'newsletter_subscribed',
} as const;

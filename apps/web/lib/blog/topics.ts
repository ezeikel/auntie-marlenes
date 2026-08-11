/**
 * Blog topics for auto-generation
 *
 * 200+ topics across 10 categories, focused on Black hair care,
 * natural hair, and beauty content for the UK market.
 */

export interface BlogTopic {
  topic: string;
  category: string;
  keywords: string[];
  priority?: 'search-console';
  productTerms?: string[];
}

export const BLOG_CATEGORIES = [
  'Natural Hair Care',
  'Protective Styles',
  'Hair Products',
  'Hair Growth',
  'Styling',
  'Skincare',
  'Beauty',
  'Wellness',
  'Trends',
  'Hair Types',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_TOPICS: BlogTopic[] = [
  // Search Console demand, final data through 6 August 2026. Each topic maps
  // to products confirmed in the live Shopify catalogue.
  {
    topic:
      "How to use Nala's detangling spray in a gentle children's hair routine",
    category: 'Natural Hair Care',
    keywords: [
      "Nala's detangling spray",
      "children's textured hair",
      'detangling routine',
    ],
    priority: 'search-console',
    productTerms: ["Nala's", 'detangle spray'],
  },
  {
    topic: "How to use Nala's curl defining jelly without a crunchy finish",
    category: 'Hair Products',
    keywords: ["Nala's curl defining jelly", 'curl jelly', "children's curls"],
    priority: 'search-console',
    productTerms: ["Nala's", 'curl defining jelly'],
  },
  {
    topic:
      'KTC pure coconut oil for textured hair: uses, limits and patch testing',
    category: 'Hair Products',
    keywords: ['KTC pure coconut oil', 'coconut oil textured hair', 'hair oil'],
    priority: 'search-console',
    productTerms: ['KTC', 'coconut oil'],
  },
  {
    topic: 'How to use Cantu leave-in conditioner by texture and routine',
    category: 'Hair Products',
    keywords: [
      'Cantu leave-in conditioner',
      'Cantu repair cream',
      'textured hair leave-in',
    ],
    priority: 'search-console',
    productTerms: ['Cantu', 'leave-in'],
  },
  {
    topic: 'Choosing a Mielle treatment for your next wash day',
    category: 'Hair Products',
    keywords: [
      'Mielle hair treatment',
      'Mielle wash day',
      'textured hair masque',
    ],
    priority: 'search-console',
    productTerms: ['Mielle'],
  },
  // ========================================
  // NATURAL HAIR CARE (25 topics)
  // ========================================
  {
    topic: 'The Ultimate Guide to Wash Day for Natural Hair',
    category: 'Natural Hair Care',
    keywords: [
      'wash day',
      'natural hair routine',
      'cleansing curls',
      'shampoo',
    ],
  },
  {
    topic: 'How to Keep Your Natural Hair Moisturised All Week',
    category: 'Natural Hair Care',
    keywords: ['moisture', 'hydration', 'LOC method', 'dry hair'],
  },
  {
    topic: 'Understanding the Protein-Moisture Balance for Healthy Hair',
    category: 'Natural Hair Care',
    keywords: ['protein', 'moisture balance', 'hair strength', 'breakage'],
  },
  {
    topic: 'The Complete Guide to Co-Washing Natural Hair',
    category: 'Natural Hair Care',
    keywords: ['co-wash', 'conditioner wash', 'curly hair', 'cleansing'],
  },
  {
    topic: 'How to Properly Detangle Natural Hair Without Breakage',
    category: 'Natural Hair Care',
    keywords: ['detangle', 'knots', 'breakage', 'wide tooth comb'],
  },
  {
    topic: 'Deep Conditioning 101: Everything You Need to Know',
    category: 'Natural Hair Care',
    keywords: [
      'deep conditioning',
      'hair mask',
      'moisture treatment',
      'repair',
    ],
  },
  {
    topic: 'The Benefits of Pre-Pooing Before Wash Day',
    category: 'Natural Hair Care',
    keywords: ['pre-poo', 'pre-shampoo', 'oil treatment', 'prep'],
  },
  {
    topic: 'How Often Should You Really Wash Your Natural Hair?',
    category: 'Natural Hair Care',
    keywords: [
      'wash frequency',
      'scalp health',
      'cleansing schedule',
      'routine',
    ],
  },
  {
    topic: 'The Importance of Clarifying Shampoo for Natural Hair',
    category: 'Natural Hair Care',
    keywords: ['clarifying', 'product buildup', 'deep cleanse', 'scalp'],
  },
  {
    topic: 'Hot Oil Treatments: Benefits and How to Do Them at Home',
    category: 'Natural Hair Care',
    keywords: ['hot oil', 'hair treatment', 'DIY', 'nourishing'],
  },
  {
    topic: 'Night-Time Hair Care Routine for Natural Hair',
    category: 'Natural Hair Care',
    keywords: ['night routine', 'pineapple', 'satin bonnet', 'preservation'],
  },
  {
    topic: 'How to Revive Dry, Lifeless Natural Hair',
    category: 'Natural Hair Care',
    keywords: ['dry hair', 'revive', 'moisture', 'restoration'],
  },
  {
    topic: 'The Ultimate Guide to Porosity and Why It Matters',
    category: 'Natural Hair Care',
    keywords: ['porosity', 'low porosity', 'high porosity', 'hair science'],
  },
  {
    topic: 'Scalp Care: The Foundation of Healthy Hair Growth',
    category: 'Natural Hair Care',
    keywords: ['scalp care', 'scalp health', 'cleansing', 'massage'],
  },
  {
    topic: 'How to Fix Hygral Fatigue in Natural Hair',
    category: 'Natural Hair Care',
    keywords: ['hygral fatigue', 'over-moisturised', 'protein', 'balance'],
  },
  {
    topic: 'Apple Cider Vinegar Rinse: Benefits for Natural Hair',
    category: 'Natural Hair Care',
    keywords: ['ACV rinse', 'apple cider vinegar', 'pH balance', 'clarifying'],
  },
  {
    topic: 'How to Maintain Your Natural Hair During Exercise',
    category: 'Natural Hair Care',
    keywords: ['exercise', 'gym', 'sweat', 'workout hair'],
  },
  {
    topic: 'The Science Behind Why Natural Hair Shrinks',
    category: 'Natural Hair Care',
    keywords: ['shrinkage', 'curl pattern', 'elasticity', 'hair science'],
  },
  {
    topic: 'How to Build a Simple but Effective Hair Care Routine',
    category: 'Natural Hair Care',
    keywords: ['routine', 'beginner', 'simple', 'effective'],
  },
  {
    topic: 'Trimming Natural Hair: When and How to Do It',
    category: 'Natural Hair Care',
    keywords: ['trimming', 'split ends', 'hair cuts', 'maintenance'],
  },
  {
    topic: 'Steam Treatments for Natural Hair: The Complete Guide',
    category: 'Natural Hair Care',
    keywords: ['steam treatment', 'hydration', 'deep conditioning', 'salon'],
  },
  {
    topic: 'How Hard Water Affects Natural Hair and What to Do',
    category: 'Natural Hair Care',
    keywords: ['hard water', 'mineral buildup', 'water quality', 'solutions'],
  },
  {
    topic: 'The Benefits of Baggying for Natural Hair',
    category: 'Natural Hair Care',
    keywords: ['baggying', 'greenhouse effect', 'moisture', 'retention'],
  },
  {
    topic: 'How to Care for Natural Hair in the UK Climate',
    category: 'Natural Hair Care',
    keywords: ['UK climate', 'humidity', 'weather', 'British weather'],
  },
  {
    topic: 'Max Hydration Method: Is It Right for Your Hair?',
    category: 'Natural Hair Care',
    keywords: ['max hydration', 'curl definition', 'moisture', 'technique'],
  },

  // ========================================
  // PROTECTIVE STYLES (25 topics)
  // ========================================
  {
    topic: 'Box Braids: The Ultimate Styling and Care Guide',
    category: 'Protective Styles',
    keywords: ['box braids', 'braiding', 'protective style', 'maintenance'],
  },
  {
    topic: 'How Long Should You Keep Your Protective Style In?',
    category: 'Protective Styles',
    keywords: [
      'protective style duration',
      'how long',
      'maintenance',
      'removal',
    ],
  },
  {
    topic: 'Caring for Your Scalp While Wearing Protective Styles',
    category: 'Protective Styles',
    keywords: ['scalp care', 'protective styles', 'itchy scalp', 'maintenance'],
  },
  {
    topic: 'The Complete Guide to Starting Locs',
    category: 'Protective Styles',
    keywords: ['locs', 'dreadlocks', 'starter locs', 'loc journey'],
  },
  {
    topic: 'Knotless Braids vs Traditional Box Braids: Which is Better?',
    category: 'Protective Styles',
    keywords: ['knotless braids', 'box braids', 'comparison', 'tension'],
  },
  {
    topic: 'Cornrows: Styles, Care and Maintenance Tips',
    category: 'Protective Styles',
    keywords: ['cornrows', 'braids', 'styling', 'maintenance'],
  },
  {
    topic: 'Crochet Braids: A Beginner-Friendly Protective Style',
    category: 'Protective Styles',
    keywords: ['crochet braids', 'beginner', 'installation', 'styles'],
  },
  {
    topic: 'How to Maintain Your Edges While Wearing Braids',
    category: 'Protective Styles',
    keywords: ['edges', 'hairline', 'traction', 'protection'],
  },
  {
    topic: 'Faux Locs: Everything You Need to Know',
    category: 'Protective Styles',
    keywords: ['faux locs', 'temporary locs', 'styling', 'installation'],
  },
  {
    topic: 'Senegalese Twists: Styling and Care Guide',
    category: 'Protective Styles',
    keywords: ['Senegalese twists', 'twists', 'protective style', 'care'],
  },
  {
    topic: 'Passion Twists: The Trendy Protective Style Guide',
    category: 'Protective Styles',
    keywords: ['passion twists', 'spring twists', 'trendy', 'installation'],
  },
  {
    topic: 'Wigs 101: Choosing and Caring for Your First Wig',
    category: 'Protective Styles',
    keywords: ['wigs', 'beginner', 'choosing', 'care'],
  },
  {
    topic: 'How to Properly Install a Lace Front Wig',
    category: 'Protective Styles',
    keywords: [
      'lace front',
      'wig installation',
      'natural hairline',
      'technique',
    ],
  },
  {
    topic: 'Weave Care: How to Maintain Your Sew-In',
    category: 'Protective Styles',
    keywords: ['weave', 'sew-in', 'maintenance', 'care'],
  },
  {
    topic: 'Mini Twists: A Low-Maintenance Protective Style',
    category: 'Protective Styles',
    keywords: ['mini twists', 'two strand twists', 'low maintenance', 'style'],
  },
  {
    topic: 'How to Take Down Braids Without Damaging Your Hair',
    category: 'Protective Styles',
    keywords: ['braid takedown', 'removal', 'damage prevention', 'care'],
  },
  {
    topic: 'Goddess Locs: Installation and Maintenance Guide',
    category: 'Protective Styles',
    keywords: ['goddess locs', 'bohemian locs', 'styling', 'maintenance'],
  },
  {
    topic: 'Protective Styles for Different Hair Lengths',
    category: 'Protective Styles',
    keywords: ['hair length', 'short hair', 'long hair', 'styles'],
  },
  {
    topic: 'The Truth About Tension and Traction Alopecia',
    category: 'Protective Styles',
    keywords: ['tension', 'traction alopecia', 'hair loss', 'prevention'],
  },
  {
    topic: 'Butterfly Locs: The Trendy Distressed Loc Style',
    category: 'Protective Styles',
    keywords: ['butterfly locs', 'distressed locs', 'trendy', 'installation'],
  },
  {
    topic: 'How to Sleep Comfortably with Protective Styles',
    category: 'Protective Styles',
    keywords: ['sleeping', 'protective styles', 'night routine', 'comfort'],
  },
  {
    topic: 'Ghana Braids: Classic Styles and Modern Variations',
    category: 'Protective Styles',
    keywords: ['Ghana braids', 'feed-in braids', 'classic', 'variations'],
  },
  {
    topic: 'Fulani Braids: Cultural Significance and Styling',
    category: 'Protective Styles',
    keywords: ['Fulani braids', 'cultural', 'beads', 'styling'],
  },
  {
    topic: 'How to Refresh Your Protective Style Mid-Wear',
    category: 'Protective Styles',
    keywords: ['refresh', 'maintenance', 'mid-wear', 'extending'],
  },
  {
    topic: 'U-Part Wigs: The Perfect Blend of Natural and Protective',
    category: 'Protective Styles',
    keywords: ['U-part wig', 'blend', 'natural hair', 'protective'],
  },

  // ========================================
  // HAIR PRODUCTS (20 topics)
  // ========================================
  {
    topic: 'Building Your Natural Hair Product Stash: The Essentials',
    category: 'Hair Products',
    keywords: ['product stash', 'essentials', 'beginner', 'must-haves'],
  },
  {
    topic: 'How to Read Hair Product Labels Like a Pro',
    category: 'Hair Products',
    keywords: ['ingredients', 'labels', 'product knowledge', 'shopping'],
  },
  {
    topic: 'The Best Oils for Natural Hair: A Complete Guide',
    category: 'Hair Products',
    keywords: ['hair oils', 'carrier oils', 'essential oils', 'moisturising'],
  },
  {
    topic: 'Silicones in Hair Products: Friend or Foe?',
    category: 'Hair Products',
    keywords: ['silicones', 'ingredients', 'buildup', 'debate'],
  },
  {
    topic: 'Sulphate-Free Shampoos: What You Need to Know',
    category: 'Hair Products',
    keywords: ['sulphate-free', 'gentle cleansing', 'shampoo', 'alternatives'],
  },
  {
    topic: 'The LOC vs LCO Method: Which Works Best for You?',
    category: 'Hair Products',
    keywords: ['LOC method', 'LCO method', 'moisturising', 'technique'],
  },
  {
    topic: 'Butters vs Oils: Understanding the Difference',
    category: 'Hair Products',
    keywords: ['butters', 'oils', 'sealing', 'moisturising'],
  },
  {
    topic: 'Edge Control Products: How to Choose and Apply',
    category: 'Hair Products',
    keywords: ['edge control', 'edges', 'styling', 'application'],
  },
  {
    topic: 'Styling Gels for Natural Hair: A Buyer Guide',
    category: 'Hair Products',
    keywords: ['styling gel', 'hold', 'definition', 'flaking'],
  },
  {
    topic: 'Leave-In Conditioners: Do You Really Need One?',
    category: 'Hair Products',
    keywords: ['leave-in conditioner', 'moisture', 'daily care', 'benefits'],
  },
  {
    topic: 'DIY Hair Products: Recipes for Natural Hair',
    category: 'Hair Products',
    keywords: ['DIY', 'homemade', 'recipes', 'natural ingredients'],
  },
  {
    topic: 'The Best Heat Protectants for Natural Hair',
    category: 'Hair Products',
    keywords: ['heat protectant', 'heat styling', 'protection', 'damage'],
  },
  {
    topic: 'Understanding Curl Creams vs Curl Custards',
    category: 'Hair Products',
    keywords: ['curl cream', 'curl custard', 'definition', 'styling'],
  },
  {
    topic: 'Black-Owned Hair Care Brands You Should Know',
    category: 'Hair Products',
    keywords: ['Black-owned', 'brands', 'support', 'community'],
  },
  {
    topic: "How to Know When a Product Isn't Working for You",
    category: 'Hair Products',
    keywords: ['product junkie', 'trial', 'results', 'switching'],
  },
  {
    topic: 'The Role of pH in Hair Products',
    category: 'Hair Products',
    keywords: ['pH balance', 'acidity', 'hair science', 'products'],
  },
  {
    topic: "Hair Mousse vs Foam: What's the Difference?",
    category: 'Hair Products',
    keywords: ['mousse', 'foam', 'styling', 'volume'],
  },
  {
    topic: 'Protein Treatments: Types and How to Use Them',
    category: 'Hair Products',
    keywords: ['protein treatment', 'keratin', 'strengthening', 'repair'],
  },
  {
    topic: 'The Best Products for Wash and Go Styles',
    category: 'Hair Products',
    keywords: ['wash and go', 'products', 'definition', 'hold'],
  },
  {
    topic: 'Affordable vs High-End Hair Products: Worth the Splurge?',
    category: 'Hair Products',
    keywords: ['affordable', 'high-end', 'drugstore', 'comparison'],
  },

  // ========================================
  // HAIR GROWTH (20 topics)
  // ========================================
  {
    topic: 'How to Maximise Hair Growth: Science-Based Tips',
    category: 'Hair Growth',
    keywords: ['hair growth', 'length retention', 'science', 'tips'],
  },
  {
    topic: "Length Retention: Why Your Hair Isn't Growing",
    category: 'Hair Growth',
    keywords: ['length retention', 'breakage', 'growth', 'tips'],
  },
  {
    topic: 'The Truth About Hair Growth Supplements',
    category: 'Hair Growth',
    keywords: ['supplements', 'biotin', 'vitamins', 'growth'],
  },
  {
    topic: 'Scalp Massage for Hair Growth: Does It Work?',
    category: 'Hair Growth',
    keywords: ['scalp massage', 'blood circulation', 'growth', 'technique'],
  },
  {
    topic: 'Rice Water for Hair Growth: The Complete Guide',
    category: 'Hair Growth',
    keywords: ['rice water', 'DIY', 'growth', 'treatment'],
  },
  {
    topic: 'How Diet Affects Your Hair Growth',
    category: 'Hair Growth',
    keywords: ['diet', 'nutrition', 'hair health', 'food'],
  },
  {
    topic: 'Understanding the Hair Growth Cycle',
    category: 'Hair Growth',
    keywords: ['growth cycle', 'anagen', 'telogen', 'hair science'],
  },
  {
    topic: 'Castor Oil for Hair Growth: Facts vs Fiction',
    category: 'Hair Growth',
    keywords: ['castor oil', 'JBCO', 'growth', 'thickness'],
  },
  {
    topic: 'How Stress Affects Hair Growth and What to Do',
    category: 'Hair Growth',
    keywords: ['stress', 'hair loss', 'telogen effluvium', 'wellness'],
  },
  {
    topic: 'Hair Growth After the Big Chop: What to Expect',
    category: 'Hair Growth',
    keywords: ['big chop', 'TWA', 'growth', 'journey'],
  },
  {
    topic: 'Inversion Method for Hair Growth: Does It Work?',
    category: 'Hair Growth',
    keywords: ['inversion method', 'growth hack', 'technique', 'results'],
  },
  {
    topic: 'How to Grow Thicker, Fuller Natural Hair',
    category: 'Hair Growth',
    keywords: ['thick hair', 'fuller hair', 'density', 'volume'],
  },
  {
    topic: 'The Role of Water Intake in Hair Health',
    category: 'Hair Growth',
    keywords: ['hydration', 'water', 'hair health', 'wellness'],
  },
  {
    topic: 'Growing Out a Relaxer: The Transition Guide',
    category: 'Hair Growth',
    keywords: ['transitioning', 'relaxer', 'natural', 'growth'],
  },
  {
    topic: 'Protective Styling for Maximum Hair Growth',
    category: 'Hair Growth',
    keywords: ['protective styles', 'growth', 'retention', 'low manipulation'],
  },
  {
    topic: 'Hair Growth Oils: What Actually Works',
    category: 'Hair Growth',
    keywords: ['growth oils', 'rosemary', 'peppermint', 'stimulating'],
  },
  {
    topic: 'How Sleep Affects Your Hair Growth',
    category: 'Hair Growth',
    keywords: ['sleep', 'rest', 'growth', 'health'],
  },
  {
    topic: 'The Greenhouse Effect Method for Hair Growth',
    category: 'Hair Growth',
    keywords: ['greenhouse effect', 'growth', 'moisture', 'technique'],
  },
  {
    topic: 'Why Your Edges Are Thinning and How to Regrow Them',
    category: 'Hair Growth',
    keywords: ['edges', 'hairline', 'thinning', 'regrowth'],
  },
  {
    topic: 'Setting Realistic Hair Growth Goals',
    category: 'Hair Growth',
    keywords: ['goals', 'expectations', 'growth rate', 'patience'],
  },

  // ========================================
  // STYLING (25 topics)
  // ========================================
  {
    topic: 'How to Achieve the Perfect Twist Out',
    category: 'Styling',
    keywords: ['twist out', 'definition', 'technique', 'styling'],
  },
  {
    topic: 'Wash and Go: Tips for Defined, Lasting Curls',
    category: 'Styling',
    keywords: ['wash and go', 'curls', 'definition', 'technique'],
  },
  {
    topic: 'Bantu Knot Out: The Step-by-Step Guide',
    category: 'Styling',
    keywords: ['bantu knots', 'knot out', 'curls', 'styling'],
  },
  {
    topic: 'Flexi Rod Set on Natural Hair: A Complete Guide',
    category: 'Styling',
    keywords: ['flexi rods', 'curl set', 'heatless', 'styling'],
  },
  {
    topic: 'How to Flat Twist Natural Hair Like a Pro',
    category: 'Styling',
    keywords: ['flat twists', 'technique', 'styling', 'protective'],
  },
  {
    topic: 'Perm Rod Set: Achieving Bouncy, Defined Curls',
    category: 'Styling',
    keywords: ['perm rods', 'curl set', 'bouncy', 'definition'],
  },
  {
    topic: 'Finger Coils: The Ultimate Definition Style',
    category: 'Styling',
    keywords: ['finger coils', 'coils', 'definition', 'styling'],
  },
  {
    topic: 'How to Stretch Natural Hair Without Heat',
    category: 'Styling',
    keywords: ['stretching', 'heatless', 'length', 'techniques'],
  },
  {
    topic: 'Heat Styling Natural Hair Safely',
    category: 'Styling',
    keywords: ['heat styling', 'flat iron', 'silk press', 'protection'],
  },
  {
    topic: 'The Silk Press: Everything You Need to Know',
    category: 'Styling',
    keywords: ['silk press', 'straightening', 'salon', 'heat'],
  },
  {
    topic: 'Quick and Easy Natural Hairstyles for Work',
    category: 'Styling',
    keywords: ['work hairstyles', 'professional', 'quick', 'easy'],
  },
  {
    topic: 'Natural Hairstyles for Special Occasions',
    category: 'Styling',
    keywords: ['special occasions', 'events', 'elegant', 'formal'],
  },
  {
    topic: 'How to Style a TWA (Teeny Weeny Afro)',
    category: 'Styling',
    keywords: ['TWA', 'short hair', 'styling', 'big chop'],
  },
  {
    topic: 'High Puff Perfection: Tips for a Sleek Look',
    category: 'Styling',
    keywords: ['high puff', 'puff', 'sleek', 'edges'],
  },
  {
    topic: 'Space Buns and Fun Styles for Natural Hair',
    category: 'Styling',
    keywords: ['space buns', 'fun styles', 'creative', 'youthful'],
  },
  {
    topic: 'How to Create the Perfect Braid Out',
    category: 'Styling',
    keywords: ['braid out', 'waves', 'definition', 'technique'],
  },
  {
    topic: 'Defined Curls vs Big Hair: Styling Techniques',
    category: 'Styling',
    keywords: ['defined curls', 'big hair', 'volume', 'techniques'],
  },
  {
    topic: 'Second Day Hair: Refreshing Your Style',
    category: 'Styling',
    keywords: ['second day hair', 'refresh', 'maintenance', 'longevity'],
  },
  {
    topic: 'Natural Hair Accessories: Elevate Your Look',
    category: 'Styling',
    keywords: ['accessories', 'headwraps', 'clips', 'styling'],
  },
  {
    topic: 'The Art of Headwraps and Turbans',
    category: 'Styling',
    keywords: ['headwraps', 'turbans', 'styling', 'technique'],
  },
  {
    topic: 'Shingling Method for Ultra-Defined Curls',
    category: 'Styling',
    keywords: ['shingling', 'definition', 'curls', 'technique'],
  },
  {
    topic: 'How to Style Natural Hair for Swimming',
    category: 'Styling',
    keywords: ['swimming', 'pool', 'beach', 'protection'],
  },
  {
    topic: 'Low Manipulation Styles for Hair Growth',
    category: 'Styling',
    keywords: ['low manipulation', 'protective', 'growth', 'gentle'],
  },
  {
    topic: 'Updos and Elegant Styles for Natural Hair',
    category: 'Styling',
    keywords: ['updos', 'elegant', 'formal', 'styling'],
  },
  {
    topic: 'Afro Picks and How to Use Them for Volume',
    category: 'Styling',
    keywords: ['afro pick', 'volume', 'styling', 'tools'],
  },

  // ========================================
  // SKINCARE (20 topics)
  // ========================================
  {
    topic: 'Building a Skincare Routine for Melanin-Rich Skin',
    category: 'Skincare',
    keywords: ['skincare routine', 'melanin', 'dark skin', 'basics'],
  },
  {
    topic: 'How to Treat Hyperpigmentation on Dark Skin',
    category: 'Skincare',
    keywords: ['hyperpigmentation', 'dark spots', 'treatment', 'melanin'],
  },
  {
    topic: 'The Best Sunscreens for Dark Skin: No White Cast',
    category: 'Skincare',
    keywords: ['sunscreen', 'SPF', 'no white cast', 'UV protection'],
  },
  {
    topic: 'Understanding Melanin and How It Affects Skincare',
    category: 'Skincare',
    keywords: ['melanin', 'skin science', 'skincare', 'protection'],
  },
  {
    topic: 'Vitamin C Serums: The Key to Glowing Dark Skin',
    category: 'Skincare',
    keywords: ['vitamin C', 'brightening', 'serum', 'glow'],
  },
  {
    topic: 'How to Fade Dark Marks from Acne',
    category: 'Skincare',
    keywords: ['dark marks', 'acne scars', 'post-inflammatory', 'fading'],
  },
  {
    topic: 'Retinol for Dark Skin: Benefits and Precautions',
    category: 'Skincare',
    keywords: ['retinol', 'anti-aging', 'dark skin', 'precautions'],
  },
  {
    topic: 'The Importance of Moisturising Dark Skin',
    category: 'Skincare',
    keywords: ['moisturising', 'hydration', 'ashiness', 'glow'],
  },
  {
    topic: "Chemical Exfoliation vs Physical: What's Best for Dark Skin",
    category: 'Skincare',
    keywords: ['exfoliation', 'AHA', 'BHA', 'scrubs'],
  },
  {
    topic: 'How to Achieve Glass Skin on Darker Skin Tones',
    category: 'Skincare',
    keywords: ['glass skin', 'dewy', 'glowing', 'routine'],
  },
  {
    topic: 'Managing Oily Skin: Tips for Melanin-Rich Complexions',
    category: 'Skincare',
    keywords: ['oily skin', 'sebum control', 'shine-free', 'routine'],
  },
  {
    topic: 'Dry Skin Solutions for Dark Skin Tones',
    category: 'Skincare',
    keywords: ['dry skin', 'hydration', 'barrier repair', 'moisture'],
  },
  {
    topic: 'Skincare Ingredients to Avoid on Dark Skin',
    category: 'Skincare',
    keywords: ['ingredients', 'avoid', 'irritation', 'dark skin'],
  },
  {
    topic: 'The Double Cleanse Method for Clear Skin',
    category: 'Skincare',
    keywords: ['double cleanse', 'oil cleansing', 'clear skin', 'routine'],
  },
  {
    topic: 'Niacinamide: A Powerhouse Ingredient for Melanin-Rich Skin',
    category: 'Skincare',
    keywords: [
      'niacinamide',
      'pores',
      'skin barrier',
      'texture',
      'melanin-rich skin',
    ],
  },
  {
    topic: 'Body Care for Even-Toned, Glowing Skin',
    category: 'Skincare',
    keywords: ['body care', 'even tone', 'body lotion', 'glow'],
  },
  {
    topic: 'How to Deal with Keloids and Hypertrophic Scars',
    category: 'Skincare',
    keywords: ['keloids', 'scars', 'treatment', 'prevention'],
  },
  {
    topic: 'The Best Face Masks for Dark Skin',
    category: 'Skincare',
    keywords: ['face masks', 'clay masks', 'sheet masks', 'treatment'],
  },
  {
    topic: 'Under-Eye Care for Dark Circles on Dark Skin',
    category: 'Skincare',
    keywords: ['dark circles', 'under-eye', 'eye cream', 'brightening'],
  },
  {
    topic: 'Acne-Fighting Ingredients Safe for Dark Skin',
    category: 'Skincare',
    keywords: ['acne', 'salicylic acid', 'benzoyl peroxide', 'treatment'],
  },

  // ========================================
  // BEAUTY (15 topics)
  // ========================================
  {
    topic: 'Foundation Matching for Dark Skin Tones',
    category: 'Beauty',
    keywords: ['foundation', 'matching', 'undertones', 'makeup'],
  },
  {
    topic: 'The Best Lip Colours for Dark Skin',
    category: 'Beauty',
    keywords: ['lipstick', 'lip colours', 'dark skin', 'makeup'],
  },
  {
    topic: 'Highlighting and Contouring for Melanin-Rich Skin',
    category: 'Beauty',
    keywords: ['highlight', 'contour', 'sculpting', 'makeup'],
  },
  {
    topic: 'Eye Makeup Tips for Dark Skin Tones',
    category: 'Beauty',
    keywords: ['eye makeup', 'eyeshadow', 'eyeliner', 'dark skin'],
  },
  {
    topic: 'Natural Makeup Looks for Everyday Glam',
    category: 'Beauty',
    keywords: ['natural makeup', 'everyday', 'minimal', 'glam'],
  },
  {
    topic: 'Bold Makeup Looks for Special Occasions',
    category: 'Beauty',
    keywords: ['bold makeup', 'special occasion', 'glamorous', 'statement'],
  },
  {
    topic: 'Setting Makeup for Long-Lasting Wear',
    category: 'Beauty',
    keywords: ['setting', 'powder', 'setting spray', 'long-lasting'],
  },
  {
    topic: 'Brow Shaping and Filling for Dark Skin',
    category: 'Beauty',
    keywords: ['eyebrows', 'brow shaping', 'filling', 'grooming'],
  },
  {
    topic: 'The Best Blushes for Dark Skin',
    category: 'Beauty',
    keywords: ['blush', 'colour', 'dark skin', 'application'],
  },
  {
    topic: 'Makeup Primers: Do You Need One?',
    category: 'Beauty',
    keywords: ['primer', 'base', 'long-lasting', 'smooth'],
  },
  {
    topic: 'Black-Owned Beauty Brands to Support',
    category: 'Beauty',
    keywords: ['Black-owned', 'brands', 'support', 'makeup'],
  },
  {
    topic: 'How to Apply False Lashes Like a Pro',
    category: 'Beauty',
    keywords: ['false lashes', 'application', 'technique', 'glam'],
  },
  {
    topic: 'Nail Care and Trending Styles for Melanin Queens',
    category: 'Beauty',
    keywords: ['nail care', 'manicure', 'trends', 'nail art'],
  },
  {
    topic: 'Fragrance Guide: Finding Your Signature Scent',
    category: 'Beauty',
    keywords: ['fragrance', 'perfume', 'scent', 'signature'],
  },
  {
    topic: 'Skincare-First Makeup: The Healthy Approach',
    category: 'Beauty',
    keywords: ['skincare', 'makeup', 'healthy', 'natural look'],
  },

  // ========================================
  // WELLNESS (15 topics)
  // ========================================
  {
    topic: 'Self-Care Rituals for Busy Women',
    category: 'Wellness',
    keywords: ['self-care', 'busy', 'rituals', 'routine'],
  },
  {
    topic: 'The Connection Between Mental Health and Hair',
    category: 'Wellness',
    keywords: ['mental health', 'hair', 'stress', 'self-esteem'],
  },
  {
    topic: 'Creating a Spa Day at Home',
    category: 'Wellness',
    keywords: ['spa day', 'home spa', 'relaxation', 'pampering'],
  },
  {
    topic: 'How to Deal with Hair Anxiety and Comparison',
    category: 'Wellness',
    keywords: [
      'hair anxiety',
      'comparison',
      'self-acceptance',
      'mental health',
    ],
  },
  {
    topic: 'Embracing Your Natural Hair Journey',
    category: 'Wellness',
    keywords: ['natural hair journey', 'acceptance', 'embrace', 'confidence'],
  },
  {
    topic: 'Beauty Sleep: How Rest Affects Your Hair and Skin',
    category: 'Wellness',
    keywords: ['sleep', 'beauty sleep', 'rest', 'health'],
  },
  {
    topic: 'Mindful Beauty: Slowing Down Your Routine',
    category: 'Wellness',
    keywords: ['mindful', 'slow beauty', 'routine', 'presence'],
  },
  {
    topic: 'The Power of Hair Affirmations',
    category: 'Wellness',
    keywords: ['affirmations', 'positive', 'self-love', 'mindset'],
  },
  {
    topic: 'Managing Hair Loss: Emotional and Practical Tips',
    category: 'Wellness',
    keywords: ['hair loss', 'coping', 'emotional', 'support'],
  },
  {
    topic: 'Body Positivity and Natural Hair',
    category: 'Wellness',
    keywords: ['body positivity', 'self-love', 'acceptance', 'confidence'],
  },
  {
    topic: 'Teaching Children to Love Their Natural Hair',
    category: 'Wellness',
    keywords: ['children', 'natural hair', 'confidence', 'teaching'],
  },
  {
    topic: 'Breaking Free from European Beauty Standards',
    category: 'Wellness',
    keywords: ['beauty standards', 'Eurocentric', 'decolonising', 'self-love'],
  },
  {
    topic: 'The Joy of Hair Play: Finding Fun in Your Routine',
    category: 'Wellness',
    keywords: ['hair play', 'fun', 'experimentation', 'joy'],
  },
  {
    topic: 'Building Confidence Through Your Hair',
    category: 'Wellness',
    keywords: ['confidence', 'self-esteem', 'hair', 'empowerment'],
  },
  {
    topic: 'Holistic Approaches to Hair and Beauty',
    category: 'Wellness',
    keywords: ['holistic', 'natural', 'wellness', 'whole health'],
  },

  // ========================================
  // TRENDS (15 topics)
  // ========================================
  {
    topic: 'Natural Hair Trends to Watch This Year',
    category: 'Trends',
    keywords: ['trends', 'hairstyles', 'current', 'popular'],
  },
  {
    topic: 'The Return of 90s Natural Hair Styles',
    category: 'Trends',
    keywords: ['90s', 'retro', 'vintage', 'trends'],
  },
  {
    topic: 'Colour Trends for Natural Hair',
    category: 'Trends',
    keywords: ['hair colour', 'trends', 'dye', 'colouring'],
  },
  {
    topic: 'Loc Styles That Are Trending Right Now',
    category: 'Trends',
    keywords: ['locs', 'trending', 'styles', 'dreadlocks'],
  },
  {
    topic: 'The Rise of the Natural Hair Movement',
    category: 'Trends',
    keywords: ['natural hair movement', 'history', 'culture', 'community'],
  },
  {
    topic: 'Celebrity Natural Hair Moments We Love',
    category: 'Trends',
    keywords: ['celebrity', 'inspiration', 'red carpet', 'natural hair'],
  },
  {
    topic: 'Instagram-Worthy Natural Hair Styles',
    category: 'Trends',
    keywords: ['Instagram', 'social media', 'photogenic', 'styles'],
  },
  {
    topic: 'Natural Hair on the Red Carpet',
    category: 'Trends',
    keywords: ['red carpet', 'celebrity', 'glamorous', 'events'],
  },
  {
    topic: 'Wedding Hair Trends for Natural Brides',
    category: 'Trends',
    keywords: ['wedding', 'bridal', 'trends', 'natural hair'],
  },
  {
    topic: 'Bold Hair Colours: Is It Time to Try Something New?',
    category: 'Trends',
    keywords: ['bold colour', 'vibrant', 'change', 'experimentation'],
  },
  {
    topic: 'Clean Beauty Movement: What It Means for Hair Care',
    category: 'Trends',
    keywords: ['clean beauty', 'natural ingredients', 'movement', 'hair care'],
  },
  {
    topic: 'Minimalist Hair Care: The Less Is More Approach',
    category: 'Trends',
    keywords: ['minimalist', 'less is more', 'simple', 'routine'],
  },
  {
    topic: 'Textured Hair in Professional Settings: Breaking Barriers',
    category: 'Trends',
    keywords: ['professional', 'workplace', 'discrimination', 'acceptance'],
  },
  {
    topic: 'Natural Hair in Media and Representation',
    category: 'Trends',
    keywords: ['media', 'representation', 'visibility', 'culture'],
  },
  {
    topic: 'Sustainable Hair Care: Eco-Friendly Products and Practices',
    category: 'Trends',
    keywords: ['sustainable', 'eco-friendly', 'environment', 'green beauty'],
  },

  // ========================================
  // HAIR TYPES (20 topics)
  // ========================================
  {
    topic: 'Understanding Your Curl Pattern: Type 3 vs Type 4',
    category: 'Hair Types',
    keywords: ['curl pattern', 'type 3', 'type 4', 'classification'],
  },
  {
    topic: 'Caring for 4A Hair: Tips and Product Recommendations',
    category: 'Hair Types',
    keywords: ['4a hair', 'curl pattern', 'care tips', 'products'],
  },
  {
    topic: 'Caring for 4B Hair: Tips and Product Recommendations',
    category: 'Hair Types',
    keywords: ['4b hair', 'curl pattern', 'care tips', 'products'],
  },
  {
    topic: 'Caring for 4C Hair: Tips and Product Recommendations',
    category: 'Hair Types',
    keywords: ['4c hair', 'coily', 'care tips', 'products'],
  },
  {
    topic: 'Caring for 3C Hair: Tips and Product Recommendations',
    category: 'Hair Types',
    keywords: ['3c hair', 'tight curls', 'care tips', 'products'],
  },
  {
    topic: 'Mixed Curl Patterns: How to Care for Multiple Textures',
    category: 'Hair Types',
    keywords: ['mixed textures', 'multiple patterns', 'care', 'routine'],
  },
  {
    topic: 'Low Porosity Hair: How to Get Products to Absorb',
    category: 'Hair Types',
    keywords: ['low porosity', 'absorption', 'products', 'technique'],
  },
  {
    topic: 'High Porosity Hair: Sealing in Moisture',
    category: 'Hair Types',
    keywords: ['high porosity', 'moisture retention', 'sealing', 'care'],
  },
  {
    topic: 'Fine Natural Hair: Building Volume Without Damage',
    category: 'Hair Types',
    keywords: ['fine hair', 'volume', 'thin strands', 'gentle care'],
  },
  {
    topic: 'Thick Natural Hair: Managing Density',
    category: 'Hair Types',
    keywords: ['thick hair', 'density', 'management', 'styling'],
  },
  {
    topic: 'Coarse Hair: Products and Techniques for Softness',
    category: 'Hair Types',
    keywords: ['coarse hair', 'softness', 'conditioning', 'texture'],
  },
  {
    topic: "Why Hair Typing Isn't Everything",
    category: 'Hair Types',
    keywords: ['hair typing', 'limitations', 'beyond curls', 'individuality'],
  },
  {
    topic: 'The Float Test: Determining Your Hair Porosity',
    category: 'Hair Types',
    keywords: ['float test', 'porosity test', 'DIY', 'hair science'],
  },
  {
    topic: "Hair Density vs Hair Thickness: What's the Difference?",
    category: 'Hair Types',
    keywords: ['density', 'thickness', 'strand size', 'difference'],
  },
  {
    topic: "How to Determine Your Hair's Elasticity",
    category: 'Hair Types',
    keywords: ['elasticity', 'stretch test', 'hair health', 'protein'],
  },
  {
    topic: 'Loose Curls: Caring for Type 3 Hair',
    category: 'Hair Types',
    keywords: ['type 3', 'loose curls', 'wavy', 'care'],
  },
  {
    topic: 'Heat-Damaged Hair: Identifying and Repairing',
    category: 'Hair Types',
    keywords: ['heat damage', 'repair', 'recovery', 'restoration'],
  },
  {
    topic: 'Colour-Treated Natural Hair: Special Care Needs',
    category: 'Hair Types',
    keywords: ['colour-treated', 'dyed hair', 'maintenance', 'care'],
  },
  {
    topic: 'Chemically Processed Hair: Recovery Tips',
    category: 'Hair Types',
    keywords: ['chemical damage', 'relaxed hair', 'recovery', 'treatment'],
  },
  {
    topic: 'Tightly Coiled Hair: Embracing the Shrinkage',
    category: 'Hair Types',
    keywords: ['tight coils', 'shrinkage', '4c', 'embracing'],
  },

  // Quiz-linked product recommendation articles
  {
    topic: 'The Best Products for Type 4C Hair: A Complete Guide',
    category: 'Hair Types',
    keywords: [
      '4c hair products',
      'best products',
      'coily hair',
      'deep conditioner',
      'hair oils',
    ],
  },
  {
    topic: 'Type 4B Hair Care Routine: Products That Actually Work',
    category: 'Hair Types',
    keywords: [
      '4b hair routine',
      'z-pattern coils',
      'moisturising',
      'product recommendations',
    ],
  },
  {
    topic: 'Type 3B Curls: The Best Products for Bouncy Ringlets',
    category: 'Hair Types',
    keywords: [
      '3b curls',
      'ringlets',
      'curl cream',
      'styling gel',
      'definition',
    ],
  },
  {
    topic: 'Low Porosity Hair: Products That Actually Penetrate',
    category: 'Hair Types',
    keywords: [
      'low porosity products',
      'lightweight',
      'heat cap',
      'absorption tips',
    ],
  },
  {
    topic: 'High Porosity Hair: Best Products to Lock in Moisture',
    category: 'Hair Types',
    keywords: [
      'high porosity products',
      'sealing',
      'heavy butters',
      'LOC method',
    ],
  },
  {
    topic: 'Dry Scalp with Natural Hair: Products and Remedies That Help',
    category: 'Hair Types',
    keywords: [
      'dry scalp',
      'scalp care',
      'oil treatment',
      'moisturising scalp',
    ],
  },
  {
    topic: 'Type 4A Hair: Building a Simple Wash Day Routine',
    category: 'Hair Types',
    keywords: [
      '4a wash day',
      'routine',
      'shampoo',
      'conditioner',
      'defined coils',
    ],
  },
  {
    topic: 'Best Leave-In Conditioners for Every Curl Type',
    category: 'Hair Products',
    keywords: [
      'leave-in conditioner',
      'curl type',
      'product guide',
      'moisture',
    ],
  },
  {
    topic: 'Protective Styles for Type 4 Hair: Braids, Twists, and Wigs',
    category: 'Protective Styles',
    keywords: [
      'protective styles',
      'type 4',
      'braids',
      'twists',
      'wigs',
      'extensions',
    ],
  },
  {
    topic: 'Skincare Routine for Melanin-Rich Skin: Where to Start',
    category: 'Skincare',
    keywords: [
      'melanin-rich skin',
      'skincare routine',
      'dark skin',
      'hyperpigmentation',
      'glow',
    ],
  },
];

/**
 * Get a random topic that hasn't been covered recently
 */
export function getRandomTopic(recentTopics: string[] = []): BlogTopic {
  const availableTopics = BLOG_TOPICS.filter(
    (topic) => !recentTopics.includes(topic.topic),
  );

  if (availableTopics.length === 0) {
    // If all topics have been covered, pick from all
    const randomIndex = Math.floor(Math.random() * BLOG_TOPICS.length);
    return BLOG_TOPICS[randomIndex];
  }

  const randomIndex = Math.floor(Math.random() * availableTopics.length);
  return availableTopics[randomIndex];
}

/**
 * Get the set of seed topic titles (the fixed BLOG_TOPICS list).
 *
 * Used by the dynamic topic generator to avoid regenerating anything that is
 * already part of the curated seed list.
 */
export function seedTopicSlugs(): Set<string> {
  return new Set(BLOG_TOPICS.map((t) => t.topic));
}

/**
 * Pick a fixed seed topic that has not yet been covered.
 *
 * Returns a random uncovered BlogTopic, or null once the seed list is
 * exhausted (all topics covered). A null return is the signal for callers to
 * fall back to the dynamic never-dry generator.
 */
export function pickUncoveredTopic(covered: Set<string>): BlogTopic | null {
  const available = BLOG_TOPICS.filter((topic) => !covered.has(topic.topic));

  if (available.length === 0) {
    return null;
  }

  const demanded = available.find(
    (topic) => topic.priority === 'search-console',
  );
  if (demanded) return demanded;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Get topics by category
 */
export function getTopicsByCategory(category: BlogCategory): BlogTopic[] {
  return BLOG_TOPICS.filter((topic) => topic.category === category);
}

/**
 * Get a random topic from a specific category
 */
export function getRandomTopicFromCategory(
  category: BlogCategory,
  recentTopics: string[] = [],
): BlogTopic | null {
  const categoryTopics = getTopicsByCategory(category);
  const availableTopics = categoryTopics.filter(
    (topic) => !recentTopics.includes(topic.topic),
  );

  if (availableTopics.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableTopics.length);
  return availableTopics[randomIndex];
}

/**
 * Get the total number of topics
 */
export function getTotalTopicsCount(): number {
  return BLOG_TOPICS.length;
}

/**
 * Get topics count by category
 */
export function getTopicsCountByCategory(): Record<BlogCategory, number> {
  const counts = {} as Record<BlogCategory, number>;

  for (const category of BLOG_CATEGORIES) {
    counts[category] = getTopicsByCategory(category).length;
  }

  return counts;
}

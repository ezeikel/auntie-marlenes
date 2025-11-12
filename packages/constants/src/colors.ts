/**
 * Brand color palette
 * Warm earth tones for Auntie Marlenes
 */
export const COLORS = {
  // Primary brand colors
  warmSand: '#E8DCC4',
  terracotta: '#C5705D',
  warmClay: '#B8957A',
  sageGreen: '#9CAF88',
  warmBeige: '#F5F0E8',
  cocoa: '#5D4037',
  deepEarth: '#3E2723',

  // UI colors
  light: {
    background: '#FFFFFF',
    foreground: '#171717',
    card: '#FFFFFF',
    cardForeground: '#171717',
    primary: '#171717',
    primaryForeground: '#FAFAFA',
    secondary: '#F5F5F5',
    secondaryForeground: '#171717',
    muted: '#F5F5F5',
    mutedForeground: '#737373',
    accent: '#F5F5F5',
    accentForeground: '#171717',
    destructive: '#DC2626',
    destructiveForeground: '#FAFAFA',
    border: '#E5E5E5',
    input: '#E5E5E5',
    ring: '#171717',
  },

  dark: {
    background: '#0A0A0A',
    foreground: '#FAFAFA',
    card: '#0A0A0A',
    cardForeground: '#FAFAFA',
    primary: '#FAFAFA',
    primaryForeground: '#171717',
    secondary: '#262626',
    secondaryForeground: '#FAFAFA',
    muted: '#262626',
    mutedForeground: '#A3A3A3',
    accent: '#262626',
    accentForeground: '#FAFAFA',
    destructive: '#7F1D1D',
    destructiveForeground: '#FAFAFA',
    border: '#262626',
    input: '#262626',
    ring: '#D4D4D4',
  },
} as const;

/**
 * Tab bar colors (for React Native navigation)
 */
export const TAB_COLORS = {
  light: {
    tint: COLORS.cocoa,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: COLORS.cocoa,
  },
  dark: {
    tint: COLORS.warmSand,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: COLORS.warmSand,
  },
} as const;

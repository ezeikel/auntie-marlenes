import { COLORS, TAB_COLORS } from '@auntie-marlenes/constants';

/**
 * Colors for light and dark themes
 * Re-export from shared constants for easy access
 */
export const Colors = {
  light: {
    text: COLORS.light.foreground,
    background: COLORS.light.background,
    tint: TAB_COLORS.light.tint,
    icon: TAB_COLORS.light.icon,
    tabIconDefault: TAB_COLORS.light.tabIconDefault,
    tabIconSelected: TAB_COLORS.light.tabIconSelected,
    card: COLORS.light.card,
    border: COLORS.light.border,
  },
  dark: {
    text: COLORS.dark.foreground,
    background: COLORS.dark.background,
    tint: TAB_COLORS.dark.tint,
    icon: TAB_COLORS.dark.icon,
    tabIconDefault: TAB_COLORS.dark.tabIconDefault,
    tabIconSelected: TAB_COLORS.dark.tabIconSelected,
    card: COLORS.dark.card,
    border: COLORS.dark.border,
  },
};

/**
 * Brand colors
 */
export const BrandColors = {
  warmSand: COLORS.warmSand,
  terracotta: COLORS.terracotta,
  warmClay: COLORS.warmClay,
  sageGreen: COLORS.sageGreen,
  warmBeige: COLORS.warmBeige,
  cocoa: COLORS.cocoa,
  deepEarth: COLORS.deepEarth,
};

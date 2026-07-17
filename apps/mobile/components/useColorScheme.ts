import { useColorScheme as useNativeColorScheme } from 'react-native';

// RN 0.86's ColorSchemeName includes 'unspecified'; normalise to the two theme
// keys the app actually styles so callers can index Colors[scheme] safely.
export function useColorScheme(): 'light' | 'dark' {
  return useNativeColorScheme() === 'dark' ? 'dark' : 'light';
}

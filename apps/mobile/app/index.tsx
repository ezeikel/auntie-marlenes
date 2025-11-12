import { Redirect } from 'expo-router';

/**
 * Root index - always redirects to tabs (public-first approach)
 * Authentication is optional and handled within individual screens
 */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}

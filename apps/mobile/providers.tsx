import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  ColorScheme,
  ShopifyCheckoutSheetProvider,
} from '@shopify/checkout-sheet-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from 'posthog-react-native';
import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { AuthContextProvider } from './contexts/auth';
import { CartProvider } from './contexts/cart';
import { SavedProvider } from './contexts/saved';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

type ProvidersProps = {
  children: ReactNode;
};

const Providers = ({ children }: ProvidersProps) => {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <PostHogProvider
              apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY || ''}
              options={{
                host: 'https://eu.i.posthog.com',
                enableSessionReplay: true,
                // posthog-react-native v4 moved lifecycle capture from the
                // autocapture options onto the client options.
                captureAppLifecycleEvents: true,
              }}
              autocapture={{
                captureTouches: true,
                captureScreens: true,
              }}
            >
              <ShopifyCheckoutSheetProvider
                configuration={{
                  colorScheme: ColorScheme.automatic,
                  preloading: true,
                  colors: {
                    ios: {
                      backgroundColor: '#F5F1ED', // warm-beige
                      tintColor: '#5D4037', // deep-earth
                    },
                    android: {
                      light: {
                        backgroundColor: '#F5F1ED', // warm-beige
                        progressIndicator: '#8B9D83', // sage-green
                        headerBackgroundColor: '#F5F1ED',
                        headerTextColor: '#5D4037', // deep-earth
                      },
                      dark: {
                        backgroundColor: '#2C2420', // darker variant of deep-earth
                        progressIndicator: '#8B9D83', // sage-green
                        headerBackgroundColor: '#2C2420',
                        headerTextColor: '#F5F1ED', // warm-beige
                      },
                    },
                  },
                }}
              >
                <QueryClientProvider client={queryClient}>
                  <AuthContextProvider>
                    <CartProvider>
                      <SavedProvider>
                        {children}
                        <Toaster />
                      </SavedProvider>
                    </CartProvider>
                  </AuthContextProvider>
                </QueryClientProvider>
              </ShopifyCheckoutSheetProvider>
            </PostHogProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

export default Providers;

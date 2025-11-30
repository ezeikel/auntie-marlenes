import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import appleAuth from '@invertase/react-native-apple-authentication';
import { usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import {
  signInWithGoogle as signInWithGoogleApi,
  signInWithApple as signInWithAppleApi,
  signInWithFacebook as signInWithFacebookApi,
  sendMagicLink as sendMagicLinkApi,
  getCurrentUser,
  signOut as signOutApi,
} from '@/lib/api/auth';
import * as savedStorage from '@/lib/asyncStorage/saved';
import * as cartStorage from '@/lib/asyncStorage/cart';
import { syncSavedItems } from '@/lib/api/saved';
import { updateCartBuyerIdentity } from '@/lib/api/cart';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthContextProvider');
  }
  return context;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const posthog = usePostHog();

  // Configure Google Sign-In
  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  };

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // Helper function to sync local data when user logs in
  const syncLocalDataOnLogin = async (userEmail: string) => {
    try {
      // Sync saved items from AsyncStorage to backend
      const localSaves = await savedStorage.getLocalSaves();
      if (localSaves.length > 0) {
        console.log(`[Auth] Syncing ${localSaves.length} saved items to backend`);
        await syncSavedItems(localSaves);
      }

      // Update cart buyer identity if cart exists
      const cartId = await cartStorage.getCartId();
      if (cartId) {
        console.log('[Auth] Updating cart buyer identity');
        await updateCartBuyerIdentity(cartId, userEmail);
      }
    } catch (error) {
      console.error('[Auth] Error syncing local data:', error);
      // Don't throw - this is not critical for login success
    }
  };

  // Check authentication status on mount and periodically
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = await SecureStore.getItemAsync('sessionToken');

        if (token) {
          const response = await getCurrentUser();

          if (response?.user) {
            setIsAuthenticated(true);

            // Identify user with PostHog
            if (response.user.id) {
              try {
                posthog.identify(response.user.id, {
                  email: response.user.email,
                  name: response.user.name || null,
                });
                console.log('[Auth] User identified with PostHog:', response.user.id);
              } catch (error) {
                console.error('[Auth] Error identifying user with PostHog:', error);
              }
            }

            // Identify user with Sentry
            if (response.user.id) {
              try {
                Sentry.setUser({
                  id: response.user.id,
                  email: response.user.email,
                  username: response.user.name || undefined,
                });
                console.log('[Auth] User identified with Sentry:', response.user.id);
              } catch (error) {
                console.error('[Auth] Error identifying user with Sentry:', error);
              }
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[Auth] Error checking token validity:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up periodic checks every 10 minutes
    const intervalId = setInterval(checkAuth, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [posthog]);

  const signInWithGoogle = async () => {
    try {
      const { sessionToken } = await signInWithGoogleApi();
      await SecureStore.setItemAsync('sessionToken', sessionToken);
      setIsAuthenticated(true);

      // Get user info to identify with PostHog and Sentry
      const response = await getCurrentUser();

      // Identify user with PostHog
      if (response?.user?.id) {
        try {
          posthog.identify(response.user.id, {
            email: response.user.email,
            name: response.user.name || null,
          });
          console.log('[Auth] User identified with PostHog:', response.user.id);
        } catch (error) {
          console.error('[Auth] Error identifying user with PostHog:', error);
        }
      }

      // Identify user with Sentry
      if (response?.user?.id) {
        try {
          Sentry.setUser({
            id: response.user.id,
            email: response.user.email,
            username: response.user.name || undefined,
          });
          console.log('[Auth] User identified with Sentry:', response.user.id);
        } catch (error) {
          console.error('[Auth] Error identifying user with Sentry:', error);
        }
      }

      // Sync local data (saved items and cart)
      if (response?.user?.email) {
        await syncLocalDataOnLogin(response.user.email);
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.info('[Auth] User cancelled Google sign-in');
      } else {
        console.error('[Auth] Google sign-in error:', error);
      }
      setIsAuthenticated(false);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        console.info('[Auth] User cancelled Facebook sign-in');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('No Facebook access token received');
      }

      const { sessionToken } = await signInWithFacebookApi();
      await SecureStore.setItemAsync('sessionToken', sessionToken);
      setIsAuthenticated(true);

      // Get user info to identify with PostHog and Sentry
      const response = await getCurrentUser();

      // Identify user with PostHog
      if (response?.user?.id) {
        try {
          posthog.identify(response.user.id, {
            email: response.user.email,
            name: response.user.name || null,
          });
          console.log('[Auth] User identified with PostHog:', response.user.id);
        } catch (error) {
          console.error('[Auth] Error identifying user with PostHog:', error);
        }
      }

      // Identify user with Sentry
      if (response?.user?.id) {
        try {
          Sentry.setUser({
            id: response.user.id,
            email: response.user.email,
            username: response.user.name || undefined,
          });
          console.log('[Auth] User identified with Sentry:', response.user.id);
        } catch (error) {
          console.error('[Auth] Error identifying user with Sentry:', error);
        }
      }

      // Sync local data (saved items and cart)
      if (response?.user?.email) {
        await syncLocalDataOnLogin(response.user.email);
      }
    } catch (error) {
      console.error('[Auth] Facebook sign-in error:', error);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

      if (credentialState === appleAuth.State.AUTHORIZED) {
        const { sessionToken } = await signInWithAppleApi();
        await SecureStore.setItemAsync('sessionToken', sessionToken);
        setIsAuthenticated(true);

        // Get user info to identify with PostHog and Sentry
        const response = await getCurrentUser();

        // Identify user with PostHog
        if (response?.user?.id) {
          try {
            posthog.identify(response.user.id, {
              email: response.user.email,
              name: response.user.name || null,
            });
            console.log('[Auth] User identified with PostHog:', response.user.id);
          } catch (error) {
            console.error('[Auth] Error identifying user with PostHog:', error);
          }
        }

        // Identify user with Sentry
        if (response?.user?.id) {
          try {
            Sentry.setUser({
              id: response.user.id,
              email: response.user.email,
              username: response.user.name || undefined,
            });
            console.log('[Auth] User identified with Sentry:', response.user.id);
          } catch (error) {
            console.error('[Auth] Error identifying user with Sentry:', error);
          }
        }

        // Sync local data (saved items and cart)
        if (response?.user?.email) {
          await syncLocalDataOnLogin(response.user.email);
        }
      }
    } catch (error) {
      console.error('[Auth] Apple sign-in error:', error);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      await sendMagicLinkApi(email);
    } catch (error) {
      console.error('[Auth] Magic link error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await LoginManager.logOut();

      // Reset PostHog user identity
      try {
        posthog?.reset();
        console.log('[Auth] User identity reset in PostHog');
      } catch (error) {
        console.error('[Auth] Error resetting PostHog:', error);
      }

      // Clear Sentry user identity
      try {
        Sentry.setUser(null);
        console.log('[Auth] User identity cleared in Sentry');
      } catch (error) {
        console.error('[Auth] Error clearing Sentry user:', error);
      }

      await SecureStore.deleteItemAsync('sessionToken');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('[Auth] Error signing out:', error);
      throw error;
    }
  };

  const getToken = async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('sessionToken');
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    signInWithApple,
    signInWithFacebook,
    sendMagicLink,
    signOut,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

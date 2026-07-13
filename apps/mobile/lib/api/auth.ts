import { getApiUrl } from '@auntie-marlenes/constants';
import type { User } from '@auntie-marlenes/types';
import appleAuth from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';

const apiUrl = getApiUrl(Platform.OS as 'ios' | 'android' | 'web');

/**
 * Google Sign-In
 */
export const signInWithGoogle = async (): Promise<{
  sessionToken: string;
  user: User;
}> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.data?.idToken) {
      throw new Error('No ID token received from Google Sign-In');
    }

    const response = await axios.post(`${apiUrl}/auth/mobile/google`, {
      idToken: userInfo.data.idToken,
    });

    return response.data;
  } catch (error) {
    console.error('[Auth] Google Sign-In error:', error);
    throw error;
  }
};

/**
 * Apple Sign-In
 */
export const signInWithApple = async (): Promise<{
  sessionToken: string;
  user: User;
}> => {
  try {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    const { identityToken, authorizationCode } = appleAuthRequestResponse;

    if (!identityToken) {
      throw new Error('No identity token received from Apple Sign-In');
    }

    const response = await axios.post(`${apiUrl}/api/auth/mobile/apple`, {
      identityToken,
      authorizationCode,
    });

    return response.data;
  } catch (error) {
    console.error('[Auth] Apple Sign-In error:', error);
    throw error;
  }
};

/**
 * Facebook Sign-In
 */
export const signInWithFacebook = async (): Promise<{
  sessionToken: string;
  user: User;
}> => {
  try {
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      throw new Error('User cancelled Facebook Sign-In');
    }

    const data = await AccessToken.getCurrentAccessToken();

    if (!data?.accessToken) {
      throw new Error('No access token received from Facebook Sign-In');
    }

    const response = await axios.post(`${apiUrl}/auth/mobile/facebook`, {
      accessToken: data.accessToken,
    });

    return response.data;
  } catch (error) {
    console.error('[Auth] Facebook Sign-In error:', error);
    throw error;
  }
};

/**
 * Magic Link (Email)
 */
export const sendMagicLink = async (email: string): Promise<void> => {
  try {
    await axios.post(`${apiUrl}/auth/mobile/magic-link`, { email });
  } catch (error) {
    console.error('[Auth] Send Magic Link error:', error);
    throw error;
  }
};

/**
 * Verify Magic Link Token
 * Called when user clicks magic link and mobile app receives deep link
 */
export const verifyMagicLink = async (
  token: string,
): Promise<{ sessionToken: string }> => {
  try {
    const response = await axios.post(
      `${apiUrl}/auth/mobile/magic-link/verify`,
      { token },
    );
    return response.data;
  } catch (error) {
    console.error('[Auth] Verify Magic Link error:', error);
    throw error;
  }
};

/**
 * Get Current User
 */
export const getCurrentUser = async (): Promise<{ user: User } | null> => {
  try {
    const token = await SecureStore.getItemAsync('sessionToken');

    if (!token) {
      return null;
    }

    const response = await axios.get(`${apiUrl}/auth/mobile/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('[Auth] Get Current User error:', error);
    return null;
  }
};

/**
 * Sign Out
 */
export const signOut = async (): Promise<void> => {
  try {
    // Sign out from all providers
    await GoogleSignin.signOut();
    await LoginManager.logOut();

    // Clear session token
    await SecureStore.deleteItemAsync('sessionToken');
  } catch (error) {
    console.error('[Auth] Sign Out error:', error);
    throw error;
  }
};

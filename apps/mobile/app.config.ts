import { ConfigContext, ExpoConfig } from 'expo/config';
import pkg from './package.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: "Auntie Marlene's",
    slug: 'auntie-marlenes',
    owner: 'chewybytes',
    version: pkg.version,
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'auntiemarlenes',
    userInterfaceStyle: 'light',
    ios: {
      bundleIdentifier: 'com.chewybytes.auntiemarlenes.app',
      supportsTablet: true,
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.chewybytes.auntiemarlenes.app',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#492C26',
      },
    },
    plugins: [
      'expo-router',
      'expo-dev-client',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#492C26',
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/Inter18pt-Regular.ttf',
            './assets/fonts/Inter18pt-Bold.ttf',
            './assets/fonts/Inter18pt-SemiBold.ttf',
            './assets/fonts/Inter18pt-Medium.ttf',
            './assets/fonts/Inter18pt-Light.ttf',
            './assets/fonts/Inter18pt-Italic.ttf',
            './assets/fonts/Inter18pt-Black.ttf',
            './assets/fonts/Inter18pt-BlackItalic.ttf',
            './assets/fonts/Inter18pt-BoldItalic.ttf',
            './assets/fonts/Inter18pt-ExtraBold.ttf',
            './assets/fonts/Inter18pt-ExtraBoldItalic.ttf',
            './assets/fonts/Inter18pt-ExtraLight.ttf',
            './assets/fonts/Inter18pt-ExtraLightItalic.ttf',
            './assets/fonts/Inter18pt-LightItalic.ttf',
            './assets/fonts/Inter18pt-MediumItalic.ttf',
            './assets/fonts/Inter18pt-SemiBoldItalic.ttf',
            './assets/fonts/Inter18pt-Thin.ttf',
            './assets/fonts/Inter18pt-ThinItalic.ttf',
            './assets/fonts/PlayfairDisplay-Regular.ttf',
            './assets/fonts/PlayfairDisplay-Bold.ttf',
            './assets/fonts/PlayfairDisplay-SemiBold.ttf',
            './assets/fonts/PlayfairDisplay-Medium.ttf',
            './assets/fonts/PlayfairDisplay-Italic.ttf',
            './assets/fonts/PlayfairDisplay-Black.ttf',
            './assets/fonts/PlayfairDisplay-BlackItalic.ttf',
            './assets/fonts/PlayfairDisplay-BoldItalic.ttf',
            './assets/fonts/PlayfairDisplay-ExtraBold.ttf',
            './assets/fonts/PlayfairDisplay-ExtraBoldItalic.ttf',
            './assets/fonts/PlayfairDisplay-MediumItalic.ttf',
            './assets/fonts/PlayfairDisplay-SemiBoldItalic.ttf',
          ],
        },
      ],
      'expo-localization',
      [
        'react-native-fbsdk-next',
        {
          appID: `${process.env.EXPO_PUBLIC_FACEBOOK_APP_ID}`,
          displayName: "Auntie Marlene's",
          clientToken: `${process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN}`,
          scheme: 'auntiemarlenes',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            deploymentTarget: '16.4',
          },
          android: {
            minSdkVersion: 23,
          },
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'auntie-marlenes-app',
          organization: 'chewybytes',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      eas: {
        projectId: '29cfb8ae-a3ed-40c5-9a9c-a83d839a28d1',
      },
    },
  };
};

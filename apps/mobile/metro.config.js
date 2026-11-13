// Sentry's and PostHog's Expo configs each add an id to the bundle and its
// source maps, so the maps uploaded at build time match the errors they
// symbolicate. PostHog's builds Expo's default config with its plugin, and
// Sentry's adds its own on top.
const { withNativewind } = require('nativewind/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { getPostHogExpoConfig } = require('posthog-react-native/metro');

// Sentry passes its options on, getDefaultConfig included; PostHog's would
// then call itself, so that key stops here.
/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname, {
  getDefaultConfig: (root, { getDefaultConfig: _, ...options } = {}) =>
    getPostHogExpoConfig(root, options),
});

module.exports = withNativewind(config);

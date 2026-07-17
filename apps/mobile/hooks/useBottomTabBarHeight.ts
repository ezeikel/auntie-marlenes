// As of SDK 56, expo-router vendors react-navigation and Metro bans importing
// @react-navigation/* from app code. The vendored hook (which reads the same
// context expo-router's <Tabs> provides) is only exposed under build/ — wrap
// the deep import in one place so screens keep a clean import path.
export { useBottomTabBarHeight } from 'expo-router/build/react-navigation/bottom-tabs';

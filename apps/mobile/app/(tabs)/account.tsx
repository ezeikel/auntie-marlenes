import type { User } from '@auntie-marlenes/types';
import {
  faBell,
  faBox,
  faCircleQuestion,
  faRightFromBracket,
  faShieldCheck,
  faUser,
} from '@fortawesome/pro-regular-svg-icons';
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useBottomTabBarHeight } from '@/hooks/useBottomTabBarHeight';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAuthContext } from '@/contexts/auth';
import { getCurrentUser } from '@/lib/api/auth';

export default function AccountScreen() {
  const { signOut, isAuthenticated } = useAuthContext();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Only fetch user if authenticated
        if (isAuthenticated) {
          const response = await getCurrentUser();
          if (response?.user) {
            setUser(response.user);
          }
        }
      } catch (error) {
        console.error('[Account] Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          // No redirect needed - screen will show sign-in prompt
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: faUser,
      label: 'Profile',
      onPress: () => {},
    },
    {
      icon: faBox,
      label: 'Orders',
      onPress: () => {},
    },
    {
      icon: faBell,
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: faShieldCheck,
      label: 'Privacy & Security',
      onPress: () => {},
    },
    {
      icon: faCircleQuestion,
      label: 'Help & Support',
      onPress: () => {},
    },
  ];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-beige">
        <ActivityIndicator size="large" color="#5D4037" />
      </View>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-warm-beige" edges={['top']}>
        <View
          style={{
            height: Dimensions.get('window').height - insets.top - tabBarHeight,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          {/* Card Container */}
          <View className="bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full">
            {/* Icon */}
            <View className="w-20 h-20 rounded-full bg-warm-beige items-center justify-center mb-6 self-center">
              <FontAwesomeIcon icon={faUser} size={32} color="#5D4037" />
            </View>

            {/* Messaging */}
            <Text className="text-3xl font-playfair-bold text-deep-earth mb-2 text-center">
              Welcome Back
            </Text>
            <Text className="text-base font-inter text-cocoa mb-8 text-center">
              Sign in to access your account and continue shopping
            </Text>

            {/* CTA Button */}
            <Pressable
              onPress={() => router.push('/sign-in')}
              className="bg-sage-green px-8 py-4 rounded-xl active:opacity-80 mb-6"
            >
              <Text className="text-white font-inter-semibold text-base text-center">
                Sign In
              </Text>
            </Pressable>

            {/* Trust Badges */}
            <View className="flex-row justify-center items-center gap-4">
              <View className="items-center flex-1">
                <Text className="text-lg mb-1">🔒</Text>
                <Text className="text-xs font-inter text-muted-foreground text-center">
                  Secure
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg mb-1">⚡</Text>
                <Text className="text-xs font-inter text-muted-foreground text-center">
                  Quick Access
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg mb-1">🎁</Text>
                <Text className="text-xs font-inter text-muted-foreground text-center">
                  Member Benefits
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-warm-beige" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-6">
          <Text className="text-3xl font-playfair-bold text-deep-earth mb-1">
            Account
          </Text>
          <Text className="text-sm font-inter text-cocoa">
            Manage your profile and settings
          </Text>
        </View>

        {/* User Info */}
        <View className="mx-6 mb-6 bg-white rounded-2xl p-6 border border-border">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-cocoa items-center justify-center">
              <Text className="text-2xl font-playfair-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-inter-bold text-foreground">
                {user?.name || 'User'}
              </Text>
              <Text className="text-sm font-inter text-muted-foreground">
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mx-6 mb-6 bg-white rounded-2xl border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              className={`flex-row items-center justify-between px-6 py-4 active:bg-warm-beige ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <View className="flex-row items-center flex-1">
                <FontAwesomeIcon icon={item.icon} size={20} color="#5D4037" />
                <Text className="ml-4 text-base font-inter-medium text-foreground">
                  {item.label}
                </Text>
              </View>
              <FontAwesomeIcon
                icon={faChevronRight}
                size={16}
                color="#A3A3A3"
              />
            </Pressable>
          ))}
        </View>

        {/* Sign Out */}
        <Pressable
          onPress={handleSignOut}
          className="mx-6 mb-6 bg-white rounded-2xl border border-destructive px-6 py-4 flex-row items-center justify-center active:opacity-70"
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            size={20}
            color="#DC2626"
          />
          <Text className="ml-3 text-base font-inter-semibold text-destructive">
            Sign Out
          </Text>
        </Pressable>

        {/* App Version */}
        <Text className="text-center text-xs font-inter text-muted-foreground mb-8">
          Version 0.1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

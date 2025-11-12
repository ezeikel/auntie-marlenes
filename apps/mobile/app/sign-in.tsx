import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faGoogle, faApple, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useAuthContext } from '@/contexts/auth';
import { router } from 'expo-router';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, signInWithApple, signInWithFacebook, sendMagicLink } =
    useAuthContext();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      router.replace('/(authenticated)/(tabs)');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Error', 'Apple Sign-In is only available on iOS');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithApple();
      router.replace('/(authenticated)/(tabs)');
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Apple');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithFacebook();
      router.replace('/(authenticated)/(tabs)');
    } catch (error) {
      console.error('Facebook Sign-In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Facebook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      setIsLoading(true);
      await sendMagicLink(email);
      Alert.alert(
        'Success',
        'Check your email for a magic link to sign in!',
      );
    } catch (error) {
      console.error('Magic Link Error:', error);
      Alert.alert('Error', 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-beige">
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-12">
          <Text className="text-4xl font-playfair-bold text-deep-earth mb-2">
            Auntie Marlene's
          </Text>
          <Text className="text-base font-inter text-cocoa">
            Authentic Beauty, Naturally Curated
          </Text>
        </View>

        {/* Social Sign-In Buttons */}
        <View className="gap-4 mb-8">
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            className="bg-white border border-border rounded-xl py-4 px-6 flex-row items-center justify-center active:opacity-70"
          >
            <FontAwesomeIcon icon={faGoogle} size={20} color="#364153" />
            <Text className="ml-3 text-base font-inter-semibold text-[#364153]" >
              Continue with Google
            </Text>
          </Pressable>

          <Pressable
            onPress={handleFacebookSignIn}
            disabled={isLoading}
            className="bg-[#1877F2] rounded-xl py-4 px-6 flex-row items-center justify-center active:opacity-70"
          >
            <FontAwesomeIcon icon={faFacebook} size={20} color="#FFFFFF" />
            <Text className="ml-3 text-base font-inter-semibold text-white">
              Continue with Facebook
            </Text>
          </Pressable>

          {Platform.OS === 'ios' && (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={isLoading}
              className="bg-black rounded-xl py-4 px-6 flex-row items-center justify-center active:opacity-70"
            >
              <FontAwesomeIcon icon={faApple} size={20} color="#FFFFFF" />
              <Text className="ml-3 text-base font-inter-semibold text-white">
                Continue with Apple
              </Text>
            </Pressable>
          )}
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-border" />
          <Text className="mx-4 text-sm font-inter text-muted-foreground">
            or continue with
          </Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Email Magic Link */}
        <View className="mb-8">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="bg-white border border-border rounded-xl py-4 px-6 text-base font-inter text-foreground mb-4"
            placeholderTextColor="#A3A3A3"
          />
          <Pressable
            onPress={handleMagicLink}
            disabled={isLoading}
            className="bg-sage-green rounded-xl py-4 px-6 items-center active:opacity-70"
          >
            <Text className="text-base font-inter-semibold text-white">
              Continue with Email
            </Text>
          </Pressable>
        </View>

        {/* Terms */}
        <Text className="text-xs font-inter text-center text-muted-foreground">
          By continuing, you agree to our{' '}
          <Text className="text-cocoa">Terms of Service</Text> and{' '}
          <Text className="text-cocoa">Privacy Policy</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

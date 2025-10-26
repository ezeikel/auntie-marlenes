'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGoogle,
  faFacebook,
  faApple,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/pro-regular-svg-icons';

const SignInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error('OAuth sign in error:', error);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const result = await signIn('resend', {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.ok) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Email sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-warm-beige min-h-screen">
      <AnnouncementBanner />
      <Header />

      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            {/* Sign In Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600 font-inter">
                  Sign in to access your account and continue shopping
                </p>
              </div>

              {emailSent ? (
                /* Email Sent Confirmation */
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-green/10 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-sage-green text-3xl"
                    />
                  </div>
                  <h2 className="text-2xl font-playfair font-bold text-cocoa mb-3">
                    Check your email
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We've sent a magic link to <strong>{email}</strong>. Click
                    the link in the email to sign in.
                  </p>
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="border-2 border-cocoa text-cocoa hover:bg-cocoa hover:text-white"
                  >
                    Try another email
                  </Button>
                </div>
              ) : (
                <>
                  {/* OAuth Providers */}
                  <div className="space-y-3 mb-6">
                    <Button
                      onClick={() => handleOAuthSignIn('google')}
                      disabled={isLoading}
                      className="w-full h-12 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold"
                    >
                      <FontAwesomeIcon
                        icon={faGoogle}
                        className="mr-3 text-lg"
                      />
                      Continue with Google
                    </Button>

                    <Button
                      onClick={() => handleOAuthSignIn('facebook')}
                      disabled={isLoading}
                      className="w-full h-12 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-semibold"
                    >
                      <FontAwesomeIcon
                        icon={faFacebook}
                        className="mr-3 text-lg"
                      />
                      Continue with Facebook
                    </Button>

                    <Button
                      onClick={() => handleOAuthSignIn('apple')}
                      disabled={isLoading}
                      className="w-full h-12 bg-black hover:bg-gray-900 text-white font-semibold"
                    >
                      <FontAwesomeIcon
                        icon={faApple}
                        className="mr-3 text-lg"
                      />
                      Continue with Apple
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-inter">
                        or continue with
                      </span>
                    </div>
                  </div>

                  {/* Email Magic Link */}
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2 font-inter"
                      >
                        Email address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-gray-50 border-gray-300 focus:bg-white focus:ring-sage-green focus:border-sage-green"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full h-12 bg-sage-green hover:bg-sage-green/90 text-white font-bold text-base"
                    >
                      {isLoading
                        ? 'Sending magic link...'
                        : 'Continue with Email'}
                    </Button>
                  </form>

                  {/* Terms */}
                  <p className="mt-6 text-xs text-center text-gray-500 font-inter">
                    By continuing, you agree to our{' '}
                    <Link
                      href="/terms"
                      className="text-sage-green hover:underline font-semibold"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-sage-green hover:underline font-semibold"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 font-inter">
                New to Auntie Marlene's?{' '}
                <Link
                  href="/"
                  className="text-sage-green hover:underline font-semibold"
                >
                  Start shopping
                </Link>
              </p>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sage-green text-2xl mb-2">🔒</div>
                <p className="text-xs text-gray-600 font-inter">Secure Login</p>
              </div>
              <div>
                <div className="text-sage-green text-2xl mb-2">⚡</div>
                <p className="text-xs text-gray-600 font-inter">Quick Access</p>
              </div>
              <div>
                <div className="text-sage-green text-2xl mb-2">🎁</div>
                <p className="text-xs text-gray-600 font-inter">
                  Member Rewards
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignInPage;

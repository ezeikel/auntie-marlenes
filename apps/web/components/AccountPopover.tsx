'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBox,
  faRotateLeft,
  faCircleInfo,
  faEnvelope,
} from '@fortawesome/pro-regular-svg-icons';

type AccountPopoverProps = {
  isAuthenticated: boolean;
  userName?: string;
  onClose: () => void;
  onSignOut?: () => void;
};

const AccountPopover = ({
  isAuthenticated,
  userName = 'Guest',
  onClose,
  onSignOut,
}: AccountPopoverProps) => {
  const menuItems = [
    {
      icon: faUser,
      label: 'My Account',
      href: '/account',
      badge: false,
    },
    {
      icon: faBox,
      label: 'My Orders',
      href: '/orders',
      badge: false,
    },
    {
      icon: faRotateLeft,
      label: 'My Returns',
      href: '/returns',
      badge: false,
    },
    {
      icon: faCircleInfo,
      label: 'Returns Information',
      href: '/returns-info',
      badge: false,
    },
    {
      icon: faEnvelope,
      label: 'Contact Preferences',
      href: '/preferences',
      badge: false,
    },
  ];

  const guestMenuItems = [
    {
      icon: faBox,
      label: 'My Orders',
      href: '/orders',
      badge: false,
    },
    {
      icon: faCircleInfo,
      label: 'Returns Information',
      href: '/returns-info',
      badge: false,
    },
  ];

  const displayItems = isAuthenticated ? menuItems : guestMenuItems;

  return (
    <div className="w-[320px] bg-white rounded-lg shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="font-playfair font-bold text-lg text-cocoa">
            Hi {isAuthenticated ? userName : 'there'}
          </h3>
          {isAuthenticated && (
            <button
              onClick={() => {
                onSignOut?.();
                onClose();
              }}
              className="text-sm text-gray-600 hover:text-cocoa underline transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {!isAuthenticated && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-600 mb-3">
              Sign in for a more personalized experience.
            </p>
            <div className="space-y-2">
              <Button
                asChild
                className="w-full bg-sage-green hover:bg-sage-green/90 text-white font-bold"
                onClick={onClose}
              >
                <Link href="/sign-in">SIGN IN</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent border-2 border-cocoa text-cocoa hover:bg-cocoa hover:text-white font-bold"
                onClick={onClose}
              >
                <Link href="/join">JOIN</Link>
              </Button>
            </div>
          </div>
        )}

        {displayItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-sage-green/10 transition-colors">
              <FontAwesomeIcon
                icon={item.icon}
                className="text-gray-600 group-hover:text-sage-green transition-colors"
              />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <span className="font-medium text-gray-900 group-hover:text-sage-green transition-colors">
                {item.label}
              </span>
              {item.badge && (
                <span className="w-2 h-2 rounded-full bg-terracotta" />
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      {isAuthenticated && (
        <div className="p-4 border-t border-gray-100 bg-warm-beige/30">
          <p className="text-xs text-gray-600 text-center">
            Need help?{' '}
            <Link
              href="/contact"
              className="text-sage-green font-semibold hover:underline"
              onClick={onClose}
            >
              Contact us
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountPopover;

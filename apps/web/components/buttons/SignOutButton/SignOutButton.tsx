'use client';

import { signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/pro-regular-svg-icons';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SignOutButtonProps = {
  label?: string;
  // Show the sign-out icon before the label (used on the account page fallback).
  showIcon?: boolean;
  className?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
};

const SignOutButton = ({
  label = 'Sign out',
  showIcon = false,
  className,
  variant = 'default',
  size = 'default',
}: SignOutButtonProps) => (
  <Button
    type="button"
    variant={variant}
    size={size}
    className={cn(className)}
    onClick={() => signOut({ callbackUrl: '/' })}
  >
    {showIcon && <FontAwesomeIcon icon={faRightFromBracket} />}
    {label}
  </Button>
);

export default SignOutButton;

'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex items-center gap-3 w-full rounded-lg border px-4 py-3 shadow-lg font-[var(--font-inter)] text-sm',
          title: 'font-semibold',
          description: 'text-sm opacity-70',
          actionButton:
            'ml-auto shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold',
          cancelButton: 'rounded-md px-3 py-1.5 text-sm',
          closeButton: 'absolute right-2 top-2 opacity-50 hover:opacity-100',
          success: 'bg-white text-[#3E2723] border-[#9CAF88]/40',
          error: 'bg-white text-[#3E2723] border-red-300/60',
          default: 'bg-white text-[#3E2723] border-[#5D4037]/15',
          icon: '[&>svg]:w-5 [&>svg]:h-5',
        },
        style: {
          '--normal-bg': '#FFFFFF',
          '--normal-text': '#3E2723',
          '--normal-border': 'rgba(93, 64, 55, 0.15)',
          '--success-bg': '#FFFFFF',
          '--success-text': '#3E2723',
          '--success-border': 'rgba(156, 175, 136, 0.4)',
          '--error-bg': '#FFFFFF',
          '--error-text': '#3E2723',
          '--error-border': 'rgba(239, 68, 68, 0.3)',
        } as React.CSSProperties,
        actionButtonStyle: {
          backgroundColor: '#9CAF88',
          color: '#FFFFFF',
        },
        cancelButtonStyle: {
          backgroundColor: 'rgba(93, 64, 55, 0.1)',
          color: '#5D4037',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

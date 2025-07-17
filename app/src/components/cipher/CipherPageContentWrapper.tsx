import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '@/components/theme/use-theme';

interface CipherPageContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function CipherPageContentWrapper({ children, className }: CipherPageContentWrapperProps) {
  const { theme } = useTheme();

  const baseClasses = "rounded-lg border p-3 md:p-4 space-y-3 md:space-y-4";

  return (
    <div
      className={twMerge(
        baseClasses,
        theme === 'matrix' || theme === 'emoji' ? 'bg-[var(--content-block-bg)]' : 'bg-bg',
        className
      )}
    >
      {children}
    </div>
  );
}

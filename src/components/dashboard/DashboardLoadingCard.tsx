'use client';

import { cn } from '@/lib/utils';

interface DashboardLoadingCardProps {
  className?: string;
  minHeight?: string;
}

export function DashboardLoadingCard({ className, minHeight = 'min-h-[12rem]' }: DashboardLoadingCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm',
        minHeight,
        className
      )}
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600"
        aria-hidden
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}

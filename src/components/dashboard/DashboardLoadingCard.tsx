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
        'flex items-center justify-center rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-border/40',
        minHeight,
        className
      )}
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-muted border-t-primary"
        aria-hidden
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}

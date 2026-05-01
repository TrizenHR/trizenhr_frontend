'use client';

import { cn } from '@/lib/utils';

interface DashboardShellProps {
  /** Short label shown above the title (e.g. role name) */
  badge?: string;
  title: string;
  subtitle: string;
  /** Optional primary action (e.g. Manage Organizations) */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared layout wrapper for role dashboards — primary hero strip + consistent content rhythm.
 */
export function DashboardShell({
  badge,
  title,
  subtitle,
  action,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn('mx-auto max-w-7xl space-y-6 lg:space-y-8', className)}>
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-primary-foreground/5 blur-2xl"
        />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-start md:justify-between md:p-8 lg:p-10">
          <div className="min-w-0 space-y-4">
            {badge && (
              <span className="inline-flex w-fit rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground backdrop-blur-sm">
                {badge}
              </span>
            )}
            <div className="space-y-2">
              <h1 className="text-balance text-2xl font-bold tracking-tight md:text-3xl lg:text-[2rem] lg:leading-tight">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-primary-foreground/85 md:text-base">
                {subtitle}
              </p>
            </div>
          </div>
          {action && (
            <div className="flex shrink-0 flex-wrap items-center gap-2 md:pt-1">{action}</div>
          )}
        </div>
      </section>
      {children}
    </div>
  );
}

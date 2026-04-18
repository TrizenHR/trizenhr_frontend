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
 * Shared layout wrapper for role dashboards — blue & white theme, responsive hero strip.
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
    <div className={cn('mx-auto max-w-7xl space-y-8', className)}>
      <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm ring-1 ring-blue-950/5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white to-white"
        />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-start md:justify-between md:p-8">
          <div className="min-w-0 space-y-3">
            {badge && (
              <span className="inline-flex w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                {badge}
              </span>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">{title}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-blue-900/70 md:text-base">{subtitle}</p>
            </div>
          </div>
          {action && <div className="flex shrink-0 flex-wrap gap-2 md:pt-1">{action}</div>}
        </div>
      </section>
      {children}
    </div>
  );
}

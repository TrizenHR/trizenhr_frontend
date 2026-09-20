'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Building2,
  ClipboardList,
  Settings,
} from 'lucide-react';
import { organizationApi, dashboardApi } from '@/lib/api';
import { Organization, SubscriptionPlan } from '@/lib/types';
import { DashboardShell } from './DashboardShell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SHORTCUTS = [
  {
    label: 'Organizations',
    description: 'Tenants and admins',
    href: '/dashboard/organizations',
    icon: Building2,
  },
  {
    label: 'Demo access',
    description: 'Requests and invites',
    href: '/dashboard/demo-requests',
    icon: ClipboardList,
  },
  {
    label: 'Analytics',
    description: 'Platform usage',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    description: 'System preferences',
    href: '/dashboard/settings',
    icon: Settings,
  },
] as const;

function formatOrgDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function planBadgeClass(plan: SubscriptionPlan) {
  const map: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.FREE]: 'border-border bg-muted/70 text-foreground',
    [SubscriptionPlan.BASIC]: 'border-primary/25 bg-primary/5 text-foreground',
    [SubscriptionPlan.PREMIUM]: 'border-primary/35 bg-primary/10 text-foreground',
    [SubscriptionPlan.ENTERPRISE]: 'border-primary/45 bg-primary/15 text-foreground',
  };
  return map[plan] || 'border-border bg-muted/70 text-foreground';
}

export function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [orgsData, statsData] = await Promise.all([
        organizationApi.getAll(),
        dashboardApi.getStats(),
      ]);
      setOrganizations(orgsData);
      setSystemStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalOrgs: systemStats?.totalOrganizations || 0,
    activeOrgs: systemStats?.activeOrganizations || 0,
    inactiveOrgs: systemStats?.inactiveOrganizations || 0,
    totalUsers: systemStats?.totalUsers || 0,
    paidOrgs:
      (systemStats?.organizationsByPlan?.premium || 0) +
      (systemStats?.organizationsByPlan?.enterprise || 0),
  };

  const recentOrgs = useMemo(
    () =>
      [...organizations]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 6),
    [organizations]
  );

  return (
    <DashboardShell
      badge="System admin"
      title="Welcome back"
      subtitle="A clear view of tenants, users, and the tools you use most."
      action={
        <Button
          asChild
          className="h-10 rounded-none border-0 bg-primary-foreground px-4 font-semibold text-primary shadow-sm transition hover:bg-primary-foreground/90"
        >
          <Link href="/dashboard/organizations" className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0" aria-hidden />
            Organizations
          </Link>
        </Button>
      }
    >
      {/* Compact platform summary */}
      <Card className="overflow-hidden rounded-none border-border/80 bg-card shadow-sm">
        <CardContent className="grid grid-cols-1 gap-0 p-0 sm:grid-cols-3">
          <div className="space-y-1 border-b border-border/70 p-5 sm:border-b-0 sm:border-r">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Organizations
            </p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{stats.totalOrgs}</p>
            <p className="text-sm text-muted-foreground">
              {stats.activeOrgs} active · {stats.inactiveOrgs} inactive
            </p>
          </div>
          <div className="space-y-1 border-b border-border/70 p-5 sm:border-b-0 sm:border-r">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Users
            </p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Across all tenants</p>
          </div>
          <div className="space-y-1 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Paid plans
            </p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{stats.paidOrgs}</p>
            <p className="text-sm text-muted-foreground">Premium + Enterprise</p>
          </div>
        </CardContent>
      </Card>

      {/* Single shortcut row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SHORTCUTS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 border border-border/80 bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground group-hover:text-primary">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent organizations */}
      <Card className="overflow-hidden rounded-none border-border/80 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              Recent organizations
            </CardTitle>
            <CardDescription className="text-sm">
              Newest tenants on the platform
            </CardDescription>
          </div>
          <Link
            href="/dashboard/organizations"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
          ) : recentOrgs.length > 0 ? (
            <ul className="divide-y divide-border/70">
              {recentOrgs.map((org) => (
                <li key={org._id}>
                  <Link
                    href="/dashboard/organizations"
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/25 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{org.name}</p>
                        <Badge
                          className={
                            org.isActive
                              ? 'rounded-none border border-primary/25 bg-primary/10 font-medium text-primary shadow-none'
                              : 'rounded-none border border-border bg-muted font-medium text-muted-foreground shadow-none'
                          }
                        >
                          {org.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {org.subdomain ? `${org.subdomain}.trizenhr.com` : 'No subdomain'}
                        {' · '}
                        {formatOrgDate(org.createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={`rounded-none border font-medium uppercase tracking-wide shadow-none ${planBadgeClass(org.subscriptionPlan)}`}
                      variant="outline"
                    >
                      {org.subscriptionPlan}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-t border-dashed border-border py-12 text-center">
              <p className="mb-4 text-sm text-muted-foreground">No organizations yet</p>
              <Button asChild className="rounded-none font-semibold">
                <Link href="/dashboard/organizations">Create first organization</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

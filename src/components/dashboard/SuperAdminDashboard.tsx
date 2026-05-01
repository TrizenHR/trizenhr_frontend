'use client';

import { useEffect, useState } from 'react';
import { organizationApi, dashboardApi } from '@/lib/api';
import { Organization, SubscriptionPlan } from '@/lib/types';
import { QuickActions } from './QuickActions';
import { StatCard } from './StatCard';
import { DashboardShell } from './DashboardShell';
import { UserRole } from '@/lib/types';
import { Building2, CheckCircle, MoreVertical, TrendingUp, Users, XCircle } from 'lucide-react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
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

  const stats = systemStats
    ? {
        totalOrgs: systemStats.totalOrganizations || 0,
        activeOrgs: systemStats.activeOrganizations || 0,
        inactiveOrgs: systemStats.inactiveOrganizations || 0,
        totalUsers: systemStats.totalUsers || 0,
        premiumOrgs:
          (systemStats.organizationsByPlan?.premium || 0) +
          (systemStats.organizationsByPlan?.enterprise || 0),
      }
    : {
        totalOrgs: 0,
        activeOrgs: 0,
        inactiveOrgs: 0,
        totalUsers: 0,
        premiumOrgs: 0,
      };

  /** Plan tiers — depth via primary + neutral tokens */
  const getPlanBadgeClass = (plan: SubscriptionPlan) => {
    const map: Record<SubscriptionPlan, string> = {
      [SubscriptionPlan.FREE]: 'border-border bg-muted/70 text-foreground',
      [SubscriptionPlan.BASIC]: 'border-primary/25 bg-primary/5 text-foreground',
      [SubscriptionPlan.PREMIUM]: 'border-primary/35 bg-primary/10 text-foreground',
      [SubscriptionPlan.ENTERPRISE]: 'border-primary/45 bg-primary/15 text-foreground',
    };
    return map[plan] || 'border-border bg-muted/70 text-foreground';
  };

  return (
    <DashboardShell
      badge="System admin"
      title="Platform dashboard"
      subtitle="Welcome back. Manage organizations, subscriptions, and platform-wide usage from one place."
      action={
        <Button
          asChild
          className="h-11 rounded-xl border-0 bg-primary-foreground px-5 font-semibold text-primary shadow-md transition hover:bg-primary-foreground/90"
        >
          <Link href="/dashboard/organizations" className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0" aria-hidden />
            Manage organizations
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Organizations"
          value={stats.totalOrgs}
          icon={Building2}
          description="All client orgs"
        />
        <StatCard title="Active" value={stats.activeOrgs} icon={CheckCircle} description="Running" />
        <StatCard title="Inactive" value={stats.inactiveOrgs} icon={XCircle} description="Paused" />
        <StatCard title="Total users" value={stats.totalUsers} icon={Users} description="Platform-wide" />
        <StatCard
          title="Premium tier"
          value={stats.premiumOrgs}
          icon={TrendingUp}
          description="Premium + Enterprise"
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Recent organizations
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Review and manage newly registered business entities
                </CardDescription>
              </div>
              <CardAction>
                <Link
                  href="/dashboard/organizations"
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  View all activity
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
              ) : organizations.length > 0 ? (
                <div className="space-y-2">
                  {organizations.slice(0, 5).map((org) => (
                    <div
                      key={org._id}
                      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10"
                          aria-hidden
                        >
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold leading-tight text-foreground">{org.name}</p>
                            {org.isActive ? (
                              <Badge className="border border-primary/25 bg-primary/10 font-medium text-primary shadow-none">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="border border-border bg-muted font-medium text-muted-foreground shadow-none">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {org.subdomain ? `${org.subdomain}.trizenhr.com` : 'No subdomain'}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-end">
                        <Badge
                          className={`border font-medium uppercase tracking-wide shadow-none ${getPlanBadgeClass(org.subscriptionPlan)}`}
                          variant="outline"
                        >
                          {org.subscriptionPlan}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-foreground"
                              aria-label={`Actions for ${org.name}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/organizations">Open organizations</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/users/create?orgId=${encodeURIComponent(org._id)}`}>
                                Create admin
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center">
                  <p className="mb-4 text-sm text-muted-foreground">No organizations yet</p>
                  <Button asChild className="rounded-xl font-semibold">
                    <Link href="/dashboard/organizations">Create first organization</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4">
          <QuickActions userRole={UserRole.SUPER_ADMIN} />
        </div>
      </div>
    </DashboardShell>
  );
}

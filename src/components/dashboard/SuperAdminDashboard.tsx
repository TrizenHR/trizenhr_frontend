'use client';

import { useEffect, useState } from 'react';
import { organizationApi, dashboardApi } from '@/lib/api';
import { Organization, SubscriptionPlan } from '@/lib/types';
import { QuickActions } from './QuickActions';
import { StatCard } from './StatCard';
import { DashboardShell } from './DashboardShell';
import { UserRole } from '@/lib/types';
import { Building2, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

  /** Blue & white only — plans distinguished by border + blue depth */
  const getPlanBadgeClass = (plan: SubscriptionPlan) => {
    const map: Record<SubscriptionPlan, string> = {
      [SubscriptionPlan.FREE]: 'border-blue-100 bg-blue-50 text-blue-900',
      [SubscriptionPlan.BASIC]: 'border-blue-200 bg-blue-50 text-blue-950',
      [SubscriptionPlan.PREMIUM]: 'border-blue-300 bg-white text-blue-950',
      [SubscriptionPlan.ENTERPRISE]: 'border-blue-400 bg-blue-50 text-blue-950',
    };
    return map[plan] || 'border-blue-100 bg-blue-50 text-blue-900';
  };

  return (
    <DashboardShell
      badge="System admin"
      title="Platform dashboard"
      subtitle="Manage organizations, subscriptions, and platform-wide usage from one place."
      action={
        <Link href="/dashboard/organizations">
          <Button className="rounded-xl bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700">
            Manage organizations
          </Button>
        </Link>
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
          <Card className="border-blue-100 bg-white shadow-sm ring-1 ring-blue-950/5">
            <CardHeader>
              <CardTitle className="text-lg text-blue-950">Recent organizations</CardTitle>
              <CardDescription className="text-blue-900/60">
                Latest tenants on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="py-6 text-center text-sm text-blue-900/60">Loading…</p>
              ) : organizations.length > 0 ? (
                <div className="space-y-2">
                  {organizations.slice(0, 5).map((org) => (
                    <div
                      key={org._id}
                      className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4 transition-colors hover:bg-blue-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-blue-950">{org.name}</p>
                          {org.isActive ? (
                            <Badge className="border border-blue-200 bg-white font-medium text-blue-800 shadow-none">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="border border-blue-300 bg-blue-100 font-medium text-blue-950 shadow-none">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-blue-900/65">
                          {org.subdomain ? `${org.subdomain}.trizenhr.com` : 'No subdomain'}
                        </p>
                      </div>
                      <Badge
                        className={`shrink-0 border font-medium shadow-none ${getPlanBadgeClass(org.subscriptionPlan)}`}
                        variant="outline"
                      >
                        {org.subscriptionPlan}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-blue-100 bg-blue-50/50 py-10 text-center">
                  <p className="mb-4 text-sm text-blue-900/70">No organizations yet</p>
                  <Link href="/dashboard/organizations">
                    <Button className="rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700">
                      Create first organization
                    </Button>
                  </Link>
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

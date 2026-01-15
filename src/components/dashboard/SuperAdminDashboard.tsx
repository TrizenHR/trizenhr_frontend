'use client';

import { useEffect, useState } from 'react';
import { organizationApi, dashboardApi } from '@/lib/api';
import { Organization, SubscriptionPlan } from '@/lib/types';
import { QuickActions } from './QuickActions';
import { StatCard } from './StatCard';
import { UserRole } from '@/lib/types';
import { Building2, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        dashboardApi.getStats()
      ]);
      setOrganizations(orgsData);
      setSystemStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = systemStats ? {
    totalOrgs: systemStats.totalOrganizations || 0,
    activeOrgs: systemStats.activeOrganizations || 0,
    inactiveOrgs: systemStats.inactiveOrganizations || 0,
    totalUsers: systemStats.totalUsers || 0,
    premiumOrgs: (systemStats.organizationsByPlan?.premium || 0) + (systemStats.organizationsByPlan?.enterprise || 0),
  } : {
    totalOrgs: 0,
    activeOrgs: 0,
    inactiveOrgs: 0,
    totalUsers: 0,
    premiumOrgs: 0,
  };

  const getPlanBadgeColor = (plan: SubscriptionPlan) => {
    const colors = {
      [SubscriptionPlan.FREE]: 'bg-gray-100 text-gray-800',
      [SubscriptionPlan.BASIC]: 'bg-blue-100 text-blue-800',
      [SubscriptionPlan.PREMIUM]: 'bg-purple-100 text-purple-800',
      [SubscriptionPlan.ENTERPRISE]: 'bg-yellow-100 text-yellow-800',
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Dashboard</h1>
          <p className="text-muted-foreground">Manage platform and client organizations</p>
        </div>
        <Link href="/dashboard/organizations">
          <Button>Manage Organizations</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Organizations"
          value={stats.totalOrgs}
          icon={Building2}
          description="All client orgs"
        />
        <StatCard
          title="Active"
          value={stats.activeOrgs}
          icon={CheckCircle}
          description="Running organizations"
        />
        <StatCard
          title="Inactive"
          value={stats.inactiveOrgs}
          icon={XCircle}
          description="Paused or disabled"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Across all organizations"
        />
        <StatCard
          title="Premium Tier"
          value={stats.premiumOrgs}
          icon={TrendingUp}
          description="Premium + Enterprise"
        />
      </div>

      {/* Organizations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading...</p>
              ) : organizations.length > 0 ? (
                <div className="space-y-3">
                  {organizations.slice(0, 5).map((org) => (
                    <div
                      key={org._id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{org.name}</p>
                          {org.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {org.subdomain ? `${org.subdomain}.trizenhr.com` : 'No subdomain'}
                        </p>
                      </div>
                      <Badge className={getPlanBadgeColor(org.subscriptionPlan)} variant="outline">
                        {org.subscriptionPlan}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No organizations yet</p>
                  <Link href="/dashboard/organizations">
                    <Button>Create First Organization</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <QuickActions userRole={UserRole.SUPER_ADMIN} />
      </div>
    </div>
  );
}

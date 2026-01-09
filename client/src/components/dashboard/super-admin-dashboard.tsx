'use client';

import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/dashboard/stats-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Users, UserCheck, Building2, Activity, UserPlus, Settings, FileText } from 'lucide-react';

export function SuperAdminDashboard() {
  const router = useRouter();

  const quickActions = [
    {
      label: 'Create New User',
      icon: UserPlus,
      onClick: () => router.push('/dashboard/users/create'),
      variant: 'default' as const,
    },
    {
      label: 'Manage Users',
      icon: Users,
      onClick: () => router.push('/dashboard/users'),
    },
    {
      label: 'View Reports',
      icon: FileText,
      onClick: () => router.push('/dashboard/reports'),
    },
    {
      label: 'System Settings',
      icon: Settings,
      onClick: () => router.push('/dashboard/settings'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your system overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value="124"
          description="Active users in system"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Present Today"
          value="98"
          description="79% attendance rate"
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Departments"
          value="8"
          description="Active departments"
          icon={Building2}
        />
        <StatsCard
          title="Pending Approvals"
          value="15"
          description="Leave requests pending"
          icon={Activity}
        />
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Placeholder for charts/recent activity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">User activity {i}</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <QuickActions actions={quickActions} />
      </div>
    </div>
  );
}

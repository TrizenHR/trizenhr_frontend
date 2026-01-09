'use client';

import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/dashboard/stats-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Users, UserCheck, Clock, TrendingUp, UserPlus, FileText, Calendar } from 'lucide-react';

export function AdminDashboard() {
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
      label: 'Leave Requests',
      icon: Calendar,
      onClick: () => router.push('/dashboard/leave'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Department overview and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Employees"
          value="98"
          description="In your departments"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Present Today"
          value="82"
          description="84% attendance rate"
          icon={UserCheck}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Late Check-ins"
          value="6"
          description="Today"
          icon={Clock}
          trend={{ value: 2, isPositive: false }}
        />
        <StatsCard
          title="This Month"
          value="92%"
          description="Average attendance"
          icon={TrendingUp}
          trend={{ value: 4, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Pending Leave Requests</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium">Employee Name {i}</p>
                    <p className="text-xs text-gray-500">Dec 25 - Dec 27 (3 days)</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200">
                      Approve
                    </button>
                    <button className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200">
                      Reject
                    </button>
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

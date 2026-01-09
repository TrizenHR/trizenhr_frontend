'use client';

import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/dashboard/stats-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Users, UserCheck, UserPlus, FileText, Calendar, Clock } from 'lucide-react';

export function HRDashboard() {
  const router = useRouter();

  const quickActions = [
    {
      label: 'Add New Employee',
      icon: UserPlus,
      onClick: () => router.push('/dashboard/users/create'),
      variant: 'default' as const,
    },
    {
      label: 'Manage Employees',
      icon: Users,
      onClick: () => router.push('/dashboard/users'),
    },
    {
      label: 'Leave Requests',
      icon: Calendar,
      onClick: () => router.push('/dashboard/leave'),
    },
    {
      label: 'Attendance Reports',
      icon: FileText,
      onClick: () => router.push('/dashboard/reports'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-500">Employee management and operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Employees"
          value="142"
          description="Active employees"
          icon={Users}
          trend={{ value: 10, isPositive: true }}
        />
        <StatsCard
          title="Present Today"
          value="128"
          description="90% attendance"
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="On Leave"
          value="8"
          description="Today"
          icon={Calendar}
        />
        <StatsCard
          title="Late/Absent"
          value="6"
          description="Needs attention"
          icon={Clock}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Employees</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div>
                      <p className="text-sm font-medium">New Employee {i}</p>
                      <p className="text-xs text-gray-500">Joined on Dec {20 + i}, 2025</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                    Active
                  </span>
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

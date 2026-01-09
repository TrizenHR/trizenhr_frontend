'use client';

import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/dashboard/stats-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Users, UserCheck, Calendar, TrendingUp, FileText, Clock } from 'lucide-react';

export function SupervisorDashboard() {
  const router = useRouter();

  const quickActions = [
    {
      label: 'View My Team',
      icon: Users,
      onClick: () => router.push('/dashboard/team'),
      variant: 'default' as const,
    },
    {
      label: 'Team Attendance',
      icon: Clock,
      onClick: () => router.push('/dashboard/team/attendance'),
    },
    {
      label: 'Leave Requests',
      icon: Calendar,
      onClick: () => router.push('/dashboard/team/leave'),
    },
    {
      label: 'My Attendance',
      icon: FileText,
      onClick: () => router.push('/dashboard/my-attendance'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-gray-500">Manage your team and track performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Team Members"
          value="12"
          description="In your team"
          icon={Users}
        />
        <StatsCard
          title="Present Today"
          value="10"
          description="83% attendance"
          icon={UserCheck}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="On Leave"
          value="2"
          description="Today"
          icon={Calendar}
        />
        <StatsCard
          title="Team Performance"
          value="94%"
          description="This month"
          icon={TrendingUp}
          trend={{ value: 6, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Team Attendance Today</h3>
            <div className="space-y-3">
              {[
                { name: 'John Doe', status: 'present', time: '09:00 AM' },
                { name: 'Jane Smith', status: 'present', time: '09:15 AM' },
                { name: 'Bob Johnson', status: 'late', time: '10:30 AM' },
                { name: 'Alice Williams', status: 'leave', time: 'On Leave' },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.time}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      member.status === 'present'
                        ? 'bg-green-100 text-green-700'
                        : member.status === 'late'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {member.status}
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

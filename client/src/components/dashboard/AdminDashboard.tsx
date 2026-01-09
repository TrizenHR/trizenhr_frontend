'use client';

import { QuickActions } from './QuickActions';
import { TodayAttendanceSummary } from './TodayAttendanceSummary';
import { StatCard } from './StatCard';
import { UserRole } from '@/lib/types';
import { Users, Building2, Calendar, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  // TODO: Fetch real data in Phase 3
  const mockStats = {
    totalUsers: 52,
    totalDepartments: 5,
    present: 42,
    late: 4,
    absent: 3,
    onLeave: 3,
    pendingApprovals: 7,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={mockStats.totalUsers}
          icon={Users}
          description="All roles"
        />
        <StatCard
          title="Departments"
          value={mockStats.totalDepartments}
          icon={Building2}
        />
        <StatCard
          title="Present Today"
          value={mockStats.present}
          icon={TrendingUp}
          description={`${Math.round((mockStats.present / mockStats.totalUsers) * 100)}% attendance`}
        />
        <StatCard
          title="Pending Approvals"
          value={mockStats.pendingApprovals}
          icon={Calendar}
          description="Requires action"
        />
      </div>

      {/* Attendance Summary & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TodayAttendanceSummary
            title="Today's Attendance (All Departments)"
            stats={{
              present: mockStats.present,
              late: mockStats.late,
              absent: mockStats.absent,
              onLeave: mockStats.onLeave,
              total: mockStats.totalUsers,
            }}
          />
        </div>
        <QuickActions userRole={UserRole.ADMIN} />
      </div>
    </div>
  );
}

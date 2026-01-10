'use client';

import { QuickActions } from './QuickActions';
import { TodayAttendanceSummary } from './TodayAttendanceSummary';
import { StatCard } from './StatCard';
import { UserRole } from '@/lib/types';
import { Users, UserPlus, Calendar, FileText } from 'lucide-react';

export function HRDashboard() {
  // TODO: Fetch real data in Phase 3
  const mockStats = {
    totalEmployees: 45,
    present: 38,
    late: 3,
    absent: 2,
    onLeave: 2,
    pendingLeaves: 5,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HR Dashboard</h1>
        <p className="text-muted-foreground">Employee and attendance management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={mockStats.totalEmployees}
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={mockStats.present}
          icon={UserPlus}
          description={`${Math.round((mockStats.present / mockStats.totalEmployees) * 100)}% attendance`}
        />
        <StatCard
          title="Pending Leaves"
          value={mockStats.pendingLeaves}
          icon={Calendar}
          description="Requires approval"
        />
        <StatCard
          title="Reports"
          value="View"
          icon={FileText}
        />
      </div>

      {/* Attendance Summary & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TodayAttendanceSummary
            title="Today's Attendance Summary"
            stats={{
              present: mockStats.present,
              late: mockStats.late,
              absent: mockStats.absent,
              onLeave: mockStats.onLeave,
              total: mockStats.totalEmployees,
            }}
          />
        </div>
        <QuickActions userRole={UserRole.HR} />
      </div>
    </div>
  );
}

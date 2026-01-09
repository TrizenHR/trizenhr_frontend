'use client';

import { QuickActions } from './QuickActions';
import { TodayAttendanceSummary } from './TodayAttendanceSummary';
import { StatCard } from './StatCard';
import { UserRole } from '@/lib/types';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';

export function SupervisorDashboard() {
  // TODO: Fetch real team data in Phase 3
  const mockTeamStats = {
    teamSize: 8,
    present: 6,
    late: 1,
    absent: 0,
    onLeave: 1,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        <p className="text-muted-foreground">Manage and monitor your team</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Team Size"
          value={mockTeamStats.teamSize}
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={mockTeamStats.present}
          icon={UserCheck}
          description={`${Math.round((mockTeamStats.present / mockTeamStats.teamSize) * 100)}% attendance`}
        />
        <StatCard
          title="On Leave"
          value={mockTeamStats.onLeave}
          icon={Calendar}
        />
        <StatCard
          title="Pending Approvals"
          value={0}
          icon={TrendingUp}
          description="Leave requests"
        />
      </div>

      {/* Team Attendance & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TodayAttendanceSummary
            title="Team Attendance Today"
            stats={{
              present: mockTeamStats.present,
              late: mockTeamStats.late,
              absent: mockTeamStats.absent,
              onLeave: mockTeamStats.onLeave,
              total: mockTeamStats.teamSize,
            }}
          />
        </div>
        <QuickActions userRole={UserRole.SUPERVISOR} />
      </div>
    </div>
  );
}

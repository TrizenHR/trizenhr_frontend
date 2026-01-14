'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { QuickActions } from './QuickActions';
import { TodayAttendanceSummary } from './TodayAttendanceSummary';
import { StatCard } from './StatCard';
import { UserRole } from '@/lib/types';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';

export function SupervisorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const attendancePercentage = stats?.todayAttendance
    ? Math.round((stats.todayAttendance.present / (stats.todayAttendance.total || 1)) * 100)
    : 0;

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
          value={isLoading ? '...' : (stats?.teamSize || 0)}
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={isLoading ? '...' : (stats?.todayAttendance?.present || 0)}
          icon={UserCheck}
          description={`${attendancePercentage}% attendance`}
        />
        <StatCard
          title="On Leave"
          value={isLoading ? '...' : (stats?.todayAttendance?.onLeave || 0)}
          icon={Calendar}
        />
        <StatCard
          title="Pending Approvals"
          value={isLoading ? '...' : (stats?.pendingLeaveApprovals || 0)}
          icon={TrendingUp}
          description="Leave requests"
        />
      </div>

      {/* Team Attendance & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-lg border">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
            </div>
          ) : (
            <TodayAttendanceSummary
              title="Team Attendance Today"
              stats={{
                present: stats?.todayAttendance?.present || 0,
                late: stats?.todayAttendance?.late || 0,
                absent: stats?.todayAttendance?.absent || 0,
                onLeave: stats?.todayAttendance?.onLeave || 0,
                total: stats?.todayAttendance?.total || 0,
              }}
            />
          )}
        </div>
        <QuickActions userRole={UserRole.SUPERVISOR} />
      </div>
    </div>
  );
}

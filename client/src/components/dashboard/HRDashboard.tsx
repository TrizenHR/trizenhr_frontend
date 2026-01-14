'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { QuickActions } from './QuickActions';
import { TodayAttendanceSummary } from './TodayAttendanceSummary';
import { StatCard } from './StatCard';
import { UserRole } from '@/lib/types';
import { Users, UserPlus, Calendar, FileText } from 'lucide-react';

export function HRDashboard() {
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
        <h1 className="text-3xl font-bold">HR Dashboard</h1>
        <p className="text-muted-foreground">Employee and attendance management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={isLoading ? '...' : (stats?.totalUsers || 0)}
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={isLoading ? '...' : (stats?.todayAttendance?.present || 0)}
          icon={UserPlus}
          description={`${attendancePercentage}% attendance`}
        />
        <StatCard
          title="Pending Leaves"
          value={isLoading ? '...' : (stats?.pendingLeaveApprovals || 0)}
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
          {isLoading ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-lg border">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
            </div>
          ) : (
            <TodayAttendanceSummary
              title="Today's Attendance Summary"
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
        <QuickActions userRole={UserRole.HR} />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { dashboardApi } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { QuickActions } from './QuickActions';
import { TodayAttendanceSummary } from './TodayAttendanceSummary';
import { StatCard } from './StatCard';
import { DashboardShell } from './DashboardShell';
import { DashboardLoadingCard } from './DashboardLoadingCard';
import { UserRole } from '@/lib/types';
import { Users, Building2, Calendar, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
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
    <DashboardShell
      badge="Company admin"
      title="Admin dashboard"
      subtitle={`Organization-wide snapshot${user?.organization?.name ? ` — ${user.organization.name}` : ''}. Monitor users, attendance, and pending actions.`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Total users"
          value={isLoading ? '…' : stats?.totalUsers ?? 0}
          icon={Users}
          description="All roles"
        />
        <StatCard
          title="Departments"
          value={isLoading ? '…' : stats?.totalDepartments ?? 0}
          icon={Building2}
        />
        <StatCard
          title="Present today"
          value={isLoading ? '…' : stats?.todayAttendance?.present ?? 0}
          icon={TrendingUp}
          description={`${attendancePercentage}% of tracked staff`}
        />
        <StatCard
          title="Pending approvals"
          value={isLoading ? '…' : stats?.pendingLeaveApprovals ?? 0}
          icon={Calendar}
          description="Leave requests"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          {isLoading ? (
            <DashboardLoadingCard />
          ) : (
            <TodayAttendanceSummary
              title="Today's attendance (all departments)"
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
        <div className="xl:col-span-4">
          <QuickActions userRole={UserRole.ADMIN} />
        </div>
      </div>
    </DashboardShell>
  );
}

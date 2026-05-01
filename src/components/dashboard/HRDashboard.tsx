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
import { Users, UserPlus, Calendar, FileText, Building2 } from 'lucide-react';

export function HRDashboard() {
  const { user } = useAuth();
  const organizationName = user?.organization?.name || 'your organization';
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
      badge="HR"
      title="HR dashboard"
      subtitle={`People operations and attendance visibility for ${organizationName}.`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-5">
        <StatCard
          title="Organization"
          value={organizationName}
          icon={Building2}
          description="Current tenant"
        />
        <StatCard
          title="Total employees"
          value={isLoading ? '…' : stats?.totalUsers ?? 0}
          icon={Users}
        />
        <StatCard
          title="Present today"
          value={isLoading ? '…' : stats?.todayAttendance?.present ?? 0}
          icon={UserPlus}
          description={`${attendancePercentage}% attendance`}
        />
        <StatCard
          title="Pending leaves"
          value={isLoading ? '…' : stats?.pendingLeaveApprovals ?? 0}
          icon={Calendar}
          description="Awaiting approval"
        />
        <StatCard title="Reports" value="View" icon={FileText} description="Analytics & exports" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          {isLoading ? (
            <DashboardLoadingCard />
          ) : (
            <TodayAttendanceSummary
              title="Today's attendance summary"
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
          <QuickActions userRole={UserRole.HR} />
        </div>
      </div>
    </DashboardShell>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { attendanceApi } from '@/lib/api';
import { Attendance, AttendanceStats } from '@/lib/types';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { RecentAttendanceWidget } from './RecentAttendanceWidget';
import { DashboardShell } from './DashboardShell';
import { UserRole } from '@/lib/types';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { formatWorkingHours } from '@/lib/format';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [recentRecords, setRecentRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingRecords(true);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [monthStats, attendanceHistory] = await Promise.all([
        attendanceApi.getMyStats(currentMonth, currentYear),
        attendanceApi.getMyAttendance({ page: 1, limit: 5 }),
      ]);

      setStats(monthStats);
      setRecentRecords(attendanceHistory.records || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingRecords(false);
    }
  };

  const attendancePercentage = stats
    ? Math.round(((stats.presentDays + stats.lateDays) / (stats.totalDays || 1)) * 100)
    : 0;

  return (
    <DashboardShell
      badge="Employee"
      title={`Welcome, ${user?.firstName || 'there'}!`}
      subtitle="Your attendance overview for this month — stay on track with quick stats and shortcuts."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Attendance rate"
          value={isLoading ? '…' : `${attendancePercentage}%`}
          icon={TrendingUp}
          description="This month"
        />
        <StatCard
          title="Working hours"
          value={isLoading ? '…' : formatWorkingHours(stats?.totalWorkingHours || 0)}
          icon={Clock}
          description="This month"
        />
        <StatCard
          title="Days present"
          value={isLoading ? '…' : `${stats?.presentDays ?? 0}/${stats?.totalDays ?? 0}`}
          icon={Calendar}
          description="This month"
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <RecentAttendanceWidget records={recentRecords} isLoading={isLoadingRecords} />
        </div>
        <div className="xl:col-span-4">
          <QuickActions userRole={UserRole.EMPLOYEE} />
        </div>
      </div>
    </DashboardShell>
  );
}

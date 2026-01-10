'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { attendanceApi } from '@/lib/api';
import { Attendance, AttendanceStats } from '@/lib/types';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { RecentAttendanceWidget } from './RecentAttendanceWidget';
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
        attendanceApi.getMyAttendance({ page: 1, limit: 5 }), // Get last 5 records
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Here's your attendance overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Attendance Rate"
          value={isLoading ? '...' : `${attendancePercentage}%`}
          icon={TrendingUp}
          description="This month"
        />
        <StatCard
          title="Working Hours"
          value={isLoading ? '...' : formatWorkingHours(stats?.totalWorkingHours || 0)}
          icon={Clock}
          description="This month"
        />
        <StatCard
          title="Days Present"
          value={isLoading ? '...' : `${stats?.presentDays || 0}/${stats?.totalDays || 0}`}
          icon={Calendar}
          description="This month"
        />
      </div>

      {/* Recent Attendance & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RecentAttendanceWidget records={recentRecords} isLoading={isLoadingRecords} />
        </div>
        <QuickActions userRole={UserRole.EMPLOYEE} />
      </div>
    </div>
  );
}

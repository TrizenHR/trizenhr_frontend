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
import { Building2, Calendar, Clock, TrendingUp, X, AlertTriangle } from 'lucide-react';
import { formatWorkingHours } from '@/lib/format';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [recentRecords, setRecentRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);

  // Checkout confirmation popup state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingRecords(true);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [monthStats, attendanceHistory, todayStatus] = await Promise.all([
        attendanceApi.getMyStats(currentMonth, currentYear),
        attendanceApi.getMyAttendance({ page: 1, limit: 5 }),
        attendanceApi.getTodayStatus(),
      ]);

      setStats(monthStats);
      setRecentRecords(attendanceHistory.records || []);
      setTodayAttendance(todayStatus);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingRecords(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true);
      const attendance = await attendanceApi.checkOut();
      setTodayAttendance(attendance);
      setShowCheckoutModal(false);
      // Reload dashboard data to refresh stats & recent records
      await loadDashboardData();
      toast({
        title: 'Checked Out Successfully',
        description: `Checked out at ${format(new Date(attendance.checkOut!), 'hh:mm a')}. Working hours: ${formatWorkingHours(attendance.workingHours || 0)}`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to check out';
      toast({
        title: 'Check-out Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const attendancePercentage = stats
    ? Math.round(((stats.presentDays + stats.lateDays) / (stats.totalDays || 1)) * 100)
    : 0;
  const organizationLabel = user?.organization?.name || 'Organization not available';

  // Calculate live checkout time and total hours for the modal
  const checkInTime = todayAttendance?.checkIn
    ? format(new Date(todayAttendance.checkIn), 'hh:mm a')
    : null;
  const currentTime = format(new Date(), 'hh:mm a');
  const totalMinutes = todayAttendance?.checkIn
    ? Math.floor((Date.now() - new Date(todayAttendance.checkIn).getTime()) / 60000)
    : 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const totalHoursDisplay =
    totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins}m`;

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
          color="green"
        />
        <StatCard
          title="Working hours"
          value={
            isLoading
              ? '…'
              : stats?.totalWorkingHours
              ? formatWorkingHours(stats.totalWorkingHours)
              : 'No hours logged'
          }
          icon={Clock}
          description="This month"
          color="blue"
        />
        <StatCard
          title="Days present"
          value={isLoading ? '…' : `${stats?.presentDays ?? 0}/${stats?.totalDays ?? 0}`}
          icon={Calendar}
          description="This month"
          className="sm:col-span-2 xl:col-span-1"
          color="orange"
        />
        <StatCard
          title="Organization"
          value={organizationLabel}
          icon={Building2}
          description={user?.organization?.name ? 'Your company' : 'Unable to resolve organization name'}
          className="sm:col-span-2 xl:col-span-3"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <RecentAttendanceWidget records={recentRecords} isLoading={isLoadingRecords} />
        </div>
        <div className="xl:col-span-4">
          <QuickActions
            userRole={UserRole.EMPLOYEE}
            todayAttendance={todayAttendance}
            onCheckOut={() => setShowCheckoutModal(true)}
          />
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-card">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">Confirm Check Out</h2>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Time Summary */}
            <div className="grid grid-cols-3 gap-3 px-6 pt-5">
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Checked In
                </p>
                <p className="mt-1.5 text-base font-bold text-foreground">{checkInTime || '—'}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Check Out
                </p>
                <p className="mt-1.5 text-base font-bold text-primary">{currentTime}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Hours
                </p>
                <p className="mt-1.5 text-base font-bold text-green-600">{totalHoursDisplay}</p>
              </div>
            </div>

            {/* Warning */}
            <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-sm text-amber-700">
                Once you check out, you cannot check in again today.
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 px-6 py-5">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                disabled={isCheckingOut}
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOut}
                disabled={isCheckingOut}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {isCheckingOut ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing…
                  </span>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Check Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

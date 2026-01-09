'use client';

import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/dashboard/stats-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Calendar, Clock, TrendingUp, FileText, LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmployeeDashboard() {
  const router = useRouter();

  const quickActions = [
    {
      label: 'Mark Attendance',
      icon: LogIn,
      onClick: () => router.push('/dashboard/my-attendance'),
      variant: 'default' as const,
    },
    {
      label: 'Request Leave',
      icon: Calendar,
      onClick: () => router.push('/dashboard/my-leave'),
    },
    {
      label: 'View My Profile',
      icon: User,
      onClick: () => router.push('/dashboard/profile'),
    },
    {
      label: 'Attendance History',
      icon: FileText,
      onClick: () => router.push('/dashboard/my-attendance/history'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500">Track your attendance and manage your profile</p>
      </div>

      {/* Check-in Status Card */}
      <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Good Morning! 👋</h3>
            <p className="text-sm text-blue-700">You haven't checked in today</p>
          </div>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <LogIn className="mr-2 h-5 w-5" />
            Check In Now
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="This Month"
          value="22 days"
          description="Days present"
          icon={Clock}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Attendance Rate"
          value="96%"
          description="This month"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Leave Balance"
          value="12 days"
          description="Remaining"
          icon={Calendar}
        />
        <StatsCard
          title="Late Check-ins"
          value="2"
          description="This month"
          icon={Clock}
          trend={{ value: 1, isPositive: false }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Attendance</h3>
            <div className="space-y-3">
              {[
                { date: 'Mon, Jan 1', checkIn: '09:00 AM', checkOut: '06:00 PM', hours: '9h 0m', status: 'present' },
                { date: 'Fri, Dec 29', checkIn: '09:15 AM', checkOut: '06:10 PM', hours: '8h 55m', status: 'late' },
                { date: 'Thu, Dec 28', checkIn: '08:55 AM', checkOut: '06:05 PM', hours: '9h 10m', status: 'present' },
                { date: 'Wed, Dec 27', checkIn: '-', checkOut: '-', hours: '-', status: 'leave' },
              ].map((record, i) => (
                <div key={i} className="grid grid-cols-5 items-center rounded-lg border border-gray-100 p-3 text-sm">
                  <div className="font-medium">{record.date}</div>
                  <div className="text-gray-600">{record.checkIn}</div>
                  <div className="text-gray-600">{record.checkOut}</div>
                  <div className="font-medium">{record.hours}</div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-700'
                          : record.status === 'late'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <QuickActions actions={quickActions} />
      </div>
    </div>
  );
}

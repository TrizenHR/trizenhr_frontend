'use client';

import { AttendanceStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMonthOptions, getYearOptions } from '@/lib/date-utils';
import { formatWorkingHours } from '@/lib/format';

interface AttendanceStatsCardProps {
  stats: AttendanceStats | null;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  isLoading?: boolean;
}

export function AttendanceStatsCard({
  stats,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  isLoading = false,
}: AttendanceStatsCardProps) {
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  const selectedMonthName = monthOptions.find(m => m.value === selectedMonth)?.label || '';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Statistics</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Statistics</CardTitle>
            <CardDescription>{selectedMonthName} {selectedYear}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth.toString()} onValueChange={(v) => onMonthChange(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!stats ? (
          <p className="text-sm text-muted-foreground">No data available for this month</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.presentDays || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lateDays || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absentDays || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Leave</p>
              <p className="text-2xl font-bold text-blue-600">{stats.leaveDays || 0}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-sm text-muted-foreground">Total Working Hours</p>
              <p className="text-xl font-semibold">{formatWorkingHours(stats.totalWorkingHours || 0)}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-sm text-muted-foreground">Average per Day</p>
              <p className="text-xl font-semibold">{formatWorkingHours(stats.averageWorkingHours || 0)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

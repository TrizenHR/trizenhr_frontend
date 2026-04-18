'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Attendance, AttendanceStatus } from '@/lib/types';
import { formatAttendanceDate, formatTimeOnly } from '@/lib/date-utils';
import { formatWorkingHours } from '@/lib/format';
import { cn } from '@/lib/utils';

interface RecentAttendanceWidgetProps {
  records: Attendance[];
  isLoading?: boolean;
}

/** Blue & white palette only — distinguish status via border weight + blue depth */
const statusBadgeClass: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'border-blue-200 bg-blue-50 text-blue-900',
  [AttendanceStatus.LATE]: 'border-blue-300 bg-blue-50 text-blue-950',
  [AttendanceStatus.ABSENT]: 'border-blue-400/70 bg-white text-blue-950',
  [AttendanceStatus.HALF_DAY]: 'border-blue-200 bg-white text-blue-900',
  [AttendanceStatus.ON_LEAVE]: 'border-blue-100 bg-blue-50/90 text-blue-900',
};

const statusLabels: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'Present',
  [AttendanceStatus.LATE]: 'Late',
  [AttendanceStatus.ABSENT]: 'Absent',
  [AttendanceStatus.HALF_DAY]: 'Half Day',
  [AttendanceStatus.ON_LEAVE]: 'On Leave',
};

export function RecentAttendanceWidget({ records, isLoading }: RecentAttendanceWidgetProps) {
  if (isLoading) {
    return (
      <Card className="border-blue-100 bg-white shadow-sm ring-1 ring-blue-950/5">
        <CardHeader>
          <CardTitle className="text-lg text-blue-950">Recent Attendance</CardTitle>
          <CardDescription className="text-blue-900/60">Loading your latest entries…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-blue-50/80" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="border-blue-100 bg-white shadow-sm ring-1 ring-blue-950/5">
        <CardHeader>
          <CardTitle className="text-lg text-blue-950">Recent Attendance</CardTitle>
          <CardDescription className="text-blue-900/60">Your latest check-ins will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-xl border border-dashed border-blue-100 bg-blue-50/40 py-10 text-center text-sm text-blue-900/65">
            No attendance records yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100 bg-white shadow-sm ring-1 ring-blue-950/5">
      <CardHeader>
        <CardTitle className="text-lg text-blue-950">Recent Attendance</CardTitle>
        <CardDescription className="text-blue-900/60">Last few days at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.slice(0, 5).map((record) => (
            <div
              key={record._id}
              className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-blue-950">{formatAttendanceDate(record.date)}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-900/65">
                  <span>In: {record.checkIn ? formatTimeOnly(record.checkIn) : '—'}</span>
                  <span>Out: {record.checkOut ? formatTimeOnly(record.checkOut) : '—'}</span>
                  {record.workingHours != null && (
                    <span className="font-semibold text-blue-900">
                      {formatWorkingHours(record.workingHours)}
                    </span>
                  )}
                </div>
              </div>
              <Badge
                className={cn(
                  'shrink-0 border font-medium shadow-none',
                  statusBadgeClass[record.status]
                )}
                variant="secondary"
              >
                {statusLabels[record.status]}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

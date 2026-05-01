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

/** Status chips — primary + neutral tokens */
const statusBadgeClass: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'border-primary/25 bg-primary/10 text-primary',
  [AttendanceStatus.LATE]: 'border-primary/35 bg-primary/15 text-foreground',
  [AttendanceStatus.ABSENT]: 'border-border bg-muted text-foreground',
  [AttendanceStatus.HALF_DAY]: 'border-border bg-card text-foreground',
  [AttendanceStatus.ON_LEAVE]: 'border-primary/15 bg-primary/5 text-foreground',
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
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm ring-1 ring-border/40">
        <CardHeader className="pt-5">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Recent Attendance</CardTitle>
          <CardDescription>Loading your latest entries…</CardDescription>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/60" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm ring-1 ring-border/40">
        <CardHeader className="pt-5">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Recent Attendance</CardTitle>
          <CardDescription>Your latest check-ins will appear here</CardDescription>
        </CardHeader>
        <CardContent className="pb-5">
          <p className="rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
            No attendance records yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm ring-1 ring-border/40">
      <CardHeader className="pt-5">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Recent Attendance</CardTitle>
        <CardDescription>Last few days at a glance</CardDescription>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="space-y-3">
          {records.slice(0, 5).map((record) => (
            <div
              key={record._id}
              className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/15 p-3 transition-colors hover:bg-muted/25 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{formatAttendanceDate(record.date)}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>In: {record.checkIn ? formatTimeOnly(record.checkIn) : '—'}</span>
                  <span>Out: {record.checkOut ? formatTimeOnly(record.checkOut) : '—'}</span>
                  {record.workingHours != null && (
                    <span className="font-semibold text-foreground">{formatWorkingHours(record.workingHours)}</span>
                  )}
                </div>
              </div>
              <Badge
                className={cn('shrink-0 border font-medium shadow-none', statusBadgeClass[record.status])}
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

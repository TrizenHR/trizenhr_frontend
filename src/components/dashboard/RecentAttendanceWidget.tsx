'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Attendance, AttendanceStatus } from '@/lib/types';
import { formatAttendanceDate, formatTimeOnly } from '@/lib/date-utils';
import { formatWorkingHours } from '@/lib/format';

interface RecentAttendanceWidgetProps {
  records: Attendance[];
  isLoading?: boolean;
}

const statusColors: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'bg-green-100 text-green-800',
  [AttendanceStatus.LATE]: 'bg-orange-100 text-orange-800',
  [AttendanceStatus.ABSENT]: 'bg-red-100 text-red-800',
  [AttendanceStatus.HALF_DAY]: 'bg-yellow-100 text-yellow-800',
  [AttendanceStatus.ON_LEAVE]: 'bg-blue-100 text-blue-800',
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No attendance records yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.slice(0, 5).map((record) => (
            <div
              key={record._id}
              className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{formatAttendanceDate(record.date)}</p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span>In: {record.checkIn ? formatTimeOnly(record.checkIn) : '—'}</span>
                  <span>Out: {record.checkOut ? formatTimeOnly(record.checkOut) : '—'}</span>
                  {record.workingHours && (
                    <span className="font-medium text-gray-700">
                      {formatWorkingHours(record.workingHours)}
                    </span>
                  )}
                </div>
              </div>
              <Badge className={statusColors[record.status]} variant="secondary">
                {statusLabels[record.status]}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

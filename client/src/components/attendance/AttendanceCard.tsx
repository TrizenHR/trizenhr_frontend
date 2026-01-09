'use client';

import { Attendance, AttendanceStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { formatWorkingHours } from '@/lib/format';

interface AttendanceCardProps {
  attendance: Attendance;
  showUser?: boolean;
}

const statusColors: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AttendanceStatus.LATE]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [AttendanceStatus.ABSENT]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [AttendanceStatus.HALF_DAY]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [AttendanceStatus.ON_LEAVE]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

const statusLabels: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'Present',
  [AttendanceStatus.LATE]: 'Late',
  [AttendanceStatus.ABSENT]: 'Absent',
  [AttendanceStatus.HALF_DAY]: 'Half Day',
  [AttendanceStatus.ON_LEAVE]: 'On Leave',
};

export function AttendanceCard({ attendance }: AttendanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">
              {format(new Date(attendance.date), 'MMMM dd, yyyy')}
            </CardTitle>
          </div>
          <Badge className={statusColors[attendance.status]}>
            {statusLabels[attendance.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Check In</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {attendance.checkIn
                    ? format(new Date(attendance.checkIn), 'hh:mm a')
                    : 'Not checked in'}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Check Out</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {attendance.checkOut
                    ? format(new Date(attendance.checkOut), 'hh:mm a')
                    : 'Not checked out'}
                </p>
              </div>
            </div>
          </div>

          {attendance.workingHours !== undefined && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Working Hours</p>
              <p className="text-sm font-medium">{formatWorkingHours(attendance.workingHours)}</p>
            </div>
          )}

          {attendance.notes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm">{attendance.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

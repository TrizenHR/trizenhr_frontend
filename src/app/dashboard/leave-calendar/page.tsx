'use client';

import { useEffect, useMemo, useState } from 'react';
import { leaveApi } from '@/lib/api';
import { Leave, LeaveType, LeaveStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWeekend,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  leaves: Leave[];
};

export default function LeaveCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [approvedLeaves, setApprovedLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const loadLeaves = async () => {
    try {
      setIsLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const leaves = await leaveApi.getCalendarLeaves(month, year);
      setApprovedLeaves(leaves.filter((l) => l.status === LeaveStatus.APPROVED));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load leave calendar',
        variant: 'destructive',
      });
      setApprovedLeaves([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calendarDays: CalendarDay[] = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((date) => {
      const dayLeaves = approvedLeaves.filter((leave) => {
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        return date >= leaveStart && date <= leaveEnd;
      });

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        leaves: dayLeaves,
      };
    });
  }, [approvedLeaves, currentDate]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    const colors: Record<LeaveType, string> = {
      sick: 'bg-red-100 text-red-800 border-red-200',
      casual: 'bg-blue-100 text-blue-800 border-blue-200',
      vacation: 'bg-purple-100 text-purple-800 border-purple-200',
      unpaid: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Calendar</h1>
          <p className="text-muted-foreground">Approved leaves for your scope</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth} className="cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={today} className="cursor-pointer">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth} className="cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const isToday = isSameDay(day.date, new Date());
                  const weekend = isWeekend(day.date);
                  const hasLeaves = day.leaves.length > 0;

                  return (
                    <div
                      key={index}
                      className={[
                        'min-h-24 border rounded-lg p-2',
                        !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white',
                        isToday ? 'ring-2 ring-blue-500' : '',
                        weekend && day.isCurrentMonth ? 'bg-gray-50' : '',
                        hasLeaves ? 'border-blue-200' : '',
                      ].join(' ')}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                          {format(day.date, 'd')}
                        </span>
                        {hasLeaves && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {day.leaves.length}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        {day.leaves.slice(0, 3).map((leave) => (
                          <div
                            key={leave._id}
                            className={`text-xs px-1 py-0.5 rounded border ${getLeaveTypeColor(leave.leaveType)}`}
                            title={
                              typeof leave.userId === 'object' && 'firstName' in leave.userId
                                ? `${leave.userId.firstName} ${leave.userId.lastName}`
                                : 'Leave'
                            }
                          >
                            {leave.leaveType.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {day.leaves.length > 3 && (
                          <div className="text-xs text-muted-foreground">+{day.leaves.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


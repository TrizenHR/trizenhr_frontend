'use client';

import { useEffect, useState } from 'react';
import { leaveApi, holidayApi } from '@/lib/api';
import { attendanceApi } from '@/lib/api';
import { Leave, LeaveType, Attendance, AttendanceStatus, Holiday } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWeekend, startOfWeek, endOfWeek } from 'date-fns';

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  leaves: Leave[];
  attendance?: Attendance;
  holiday?: Holiday;
};

export default function LeaveCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setIsLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Load leaves for the month
      const leavesResponse = await leaveApi.getCalendarLeaves(month, year);
      setLeaves(leavesResponse);

      // Load holidays for the year
      try {
        const holidaysResponse = await holidayApi.getAll({ year });
        setHolidays(holidaysResponse);
      } catch (error) {
        // Holidays might not be available
        setHolidays([]);
      }

      // Load attendance for the month
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      try {
        const attendanceResponse = await attendanceApi.getMyAttendance({
          startDate: monthStart,
          endDate: monthEnd,
        });
        setAttendanceRecords(attendanceResponse.records);
      } catch (error) {
        // Attendance might not be available, that's okay
        setAttendanceRecords([]);
      }

      // Generate calendar days
      generateCalendarDays();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load calendar data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const calendarData: CalendarDay[] = days.map((date) => {
      const dayLeaves = leaves.filter((leave) => {
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        return date >= leaveStart && date <= leaveEnd;
      });

      const dayAttendance = attendanceRecords.find((att) =>
        isSameDay(new Date(att.date), date)
      );

      const dayHoliday = holidays.find((holiday) =>
        isSameDay(new Date(holiday.date), date)
      );

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        leaves: dayLeaves,
        attendance: dayAttendance,
        holiday: dayHoliday,
      };
    });

    setCalendarDays(calendarData);
  };

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
      [LeaveType.SICK]: 'bg-red-100 text-red-800 border-red-200',
      [LeaveType.CASUAL]: 'bg-blue-100 text-blue-800 border-blue-200',
      [LeaveType.VACATION]: 'bg-purple-100 text-purple-800 border-purple-200',
      [LeaveType.UNPAID]: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type];
  };

  const getAttendanceColor = (status: AttendanceStatus) => {
    const colors: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: 'bg-green-100 border-green-300',
      [AttendanceStatus.ABSENT]: 'bg-red-100 border-red-300',
      [AttendanceStatus.HALF_DAY]: 'bg-yellow-100 border-yellow-300',
      [AttendanceStatus.ON_LEAVE]: 'bg-purple-100 border-purple-300',
      [AttendanceStatus.LATE]: 'bg-orange-100 border-orange-300',
      // [AttendanceStatus.HOLIDAY]: 'bg-blue-100 border-blue-300',
    };
    return colors[status] || 'bg-gray-50';
  };

  const getAttendanceLabel = (status: AttendanceStatus) => {
    const labels: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: 'P',
      [AttendanceStatus.ABSENT]: 'A',
      [AttendanceStatus.HALF_DAY]: 'H',
      [AttendanceStatus.ON_LEAVE]: 'L',
      [AttendanceStatus.LATE]: 'Lt', 
      // [AttendanceStatus.HOLIDAY]: 'Hol',
    };
    return labels[status] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Calendar</h1>
          <p className="text-muted-foreground">View leaves and attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={today}>
            Today
          </Button>
          <Button variant="outline" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Leave Types</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getLeaveTypeColor(LeaveType.SICK)} border`} variant="outline">
                S - Sick Leave
              </Badge>
              <Badge className={`${getLeaveTypeColor(LeaveType.CASUAL)} border`} variant="outline">
                C - Casual Leave
              </Badge>
              <Badge className={`${getLeaveTypeColor(LeaveType.VACATION)} border`} variant="outline">
                V - Vacation Leave
              </Badge>
              <Badge className={`${getLeaveTypeColor(LeaveType.UNPAID)} border`} variant="outline">
                U - Unpaid Leave
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Attendance Status</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getAttendanceColor(AttendanceStatus.PRESENT)} border-2`} variant="outline">
                P - Present
              </Badge>
              <Badge className={`${getAttendanceColor(AttendanceStatus.ABSENT)} border-2`} variant="outline">
                A - Absent
              </Badge>
              <Badge className={`${getAttendanceColor(AttendanceStatus.HALF_DAY)} border-2`} variant="outline">
                H - Half Day
              </Badge>
              <Badge className={`${getAttendanceColor(AttendanceStatus.ON_LEAVE)} border-2`} variant="outline">
                L - On Leave
              </Badge>
              <Badge className={`${getAttendanceColor(AttendanceStatus.LATE)} border-2`} variant="outline">
                Lt - Late
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-2 border-blue-300" variant="outline">
                🎉 Holiday
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
          <CardDescription>
            Approved leaves and attendance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const isToday = isSameDay(day.date, new Date());
                  const isWeekendDay = isWeekend(day.date);
                  const hasHoliday = !!day.holiday;

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-24 border rounded-lg p-2
                        ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
                        ${isWeekendDay && day.isCurrentMonth ? 'bg-gray-50' : ''}
                        ${hasHoliday ? 'bg-blue-50 border-blue-200' : ''}
                        ${day.attendance ? getAttendanceColor(day.attendance.status) : ''}
                      `}
                      title={day.holiday?.name}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''} ${hasHoliday ? 'text-blue-700' : ''}`}>
                          {format(day.date, 'd')}
                        </span>
                        {day.attendance && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {getAttendanceLabel(day.attendance.status)}
                          </Badge>
                        )}
                      </div>

                      {/* Holiday indicator */}
                      {day.holiday && (
                        <div className="mb-1">
                          <Badge variant="outline" className="text-xs px-1 py-0.5 bg-blue-100 text-blue-700 border-blue-300">
                            🎉 {day.holiday.name.length > 12 ? day.holiday.name.substring(0, 12) + '...' : day.holiday.name}
                          </Badge>
                        </div>
                      )}

                      {/* Leave indicators */}
                      <div className="space-y-1">
                        {day.leaves.map((leave) => (
                          <div
                            key={leave._id}
                            className={`text-xs px-1 py-0.5 rounded border ${getLeaveTypeColor(leave.leaveType)}`}
                            title={`${leave.leaveType} - ${
                              typeof leave.userId === 'object' && 'firstName' in leave.userId
                                ? `${leave.userId.firstName} ${leave.userId.lastName}`
                                : 'Leave'
                            }`}
                          >
                            {leave.leaveType.charAt(0).toUpperCase()}
                          </div>
                        ))}
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

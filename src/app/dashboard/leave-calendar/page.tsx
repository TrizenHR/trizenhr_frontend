'use client';

import { useEffect, useMemo, useState } from 'react';
import { leaveApi } from '@/lib/api';
import { Leave, LeaveStatus } from '@/lib/types';
import { resolveLeaveTypeCode, resolveLeaveTypeName } from '@/lib/leave-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  Clock,
  Search,
  Users,
  CheckCircle2,
  CalendarDays,
  X,
} from 'lucide-react';
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

function getUserDisplayName(leave: Leave): string {
  if (typeof leave.userId === 'object' && leave.userId) {
    const fn = leave.userId.firstName || '';
    const ln = leave.userId.lastName || '';
    if (fn || ln) return `${fn} ${ln}`.trim();
  }
  return 'Employee';
}

function getUserEmail(leave: Leave): string {
  if (typeof leave.userId === 'object' && leave.userId) {
    return leave.userId.email || '';
  }
  return '';
}

function getUserEmployeeId(leave: Leave): string {
  if (typeof leave.userId === 'object' && leave.userId) {
    return leave.userId.employeeId || '';
  }
  return '';
}

function getUserDepartment(leave: Leave): string {
  if (typeof leave.userId === 'object' && leave.userId) {
    return leave.userId.department || '';
  }
  return '';
}

function getLeaveBadgeStyle(code: string) {
  const c = code.toUpperCase();
  switch (c) {
    case 'SL':
      return 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200';
    case 'CL':
      return 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200';
    case 'EL':
    case 'VAC':
      return 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200';
    case 'ML':
    case 'PL':
      return 'bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-200';
    case 'UPL':
    case 'LWP':
      return 'bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200';
    default:
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200';
  }
}

export default function LeaveCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [approvedLeaves, setApprovedLeaves] = useState<Leave[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
        // Normalize dates to midnight comparison
        const checkTime = new Date(date).setHours(0, 0, 0, 0);
        const startTime = new Date(leaveStart).setHours(0, 0, 0, 0);
        const endTime = new Date(leaveEnd).setHours(0, 0, 0, 0);
        return checkTime >= startTime && checkTime <= endTime;
      });

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        leaves: dayLeaves,
      };
    });
  }, [approvedLeaves, currentDate]);

  const leavesForSelectedDate = useMemo(() => {
    if (!selectedDate) return approvedLeaves;
    const targetTime = new Date(selectedDate).setHours(0, 0, 0, 0);
    return approvedLeaves.filter((leave) => {
      const startTime = new Date(leave.startDate).setHours(0, 0, 0, 0);
      const endTime = new Date(leave.endDate).setHours(0, 0, 0, 0);
      return targetTime >= startTime && targetTime <= endTime;
    });
  }, [approvedLeaves, selectedDate]);

  const filteredDetailsLeaves = useMemo(() => {
    let list = leavesForSelectedDate;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((leave) => {
        const name = getUserDisplayName(leave).toLowerCase();
        const email = getUserEmail(leave).toLowerCase();
        const empId = getUserEmployeeId(leave).toLowerCase();
        const type = resolveLeaveTypeName(leave).toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          empId.includes(q) ||
          type.includes(q)
        );
      });
    }
    return list;
  }, [leavesForSelectedDate, searchQuery]);

  const uniqueEmployeesOnLeave = useMemo(() => {
    const set = new Set<string>();
    approvedLeaves.forEach((leave) => {
      const id = typeof leave.userId === 'object' ? leave.userId._id : leave.userId;
      if (id) set.add(String(id));
    });
    return set.size;
  }, [approvedLeaves]);

  const onLeaveTodayCount = useMemo(() => {
    const todayTime = new Date().setHours(0, 0, 0, 0);
    return approvedLeaves.filter((leave) => {
      const startTime = new Date(leave.startDate).setHours(0, 0, 0, 0);
      const endTime = new Date(leave.endDate).setHours(0, 0, 0, 0);
      return todayTime >= startTime && todayTime <= endTime;
    }).length;
  }, [approvedLeaves]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const today = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Leave Detail Modal */}
      <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
        {selectedLeave && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-primary" />
                {getUserDisplayName(selectedLeave)}
              </DialogTitle>
              <DialogDescription>Leave Details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 bg-muted/30">
                <div>
                  <p className="text-xs text-muted-foreground">Leave Type</p>
                  <p className="font-semibold text-sm">{resolveLeaveTypeName(selectedLeave)}</p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Approved
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(new Date(selectedLeave.startDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="font-medium">{format(new Date(selectedLeave.endDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {selectedLeave.totalDays} day{selectedLeave.totalDays > 1 ? 's' : ''}
                    {selectedLeave.isHalfDay ? ' (Half Day)' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{getUserEmployeeId(selectedLeave) || '-'}</p>
                </div>
                {getUserDepartment(selectedLeave) && (
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="font-medium">{getUserDepartment(selectedLeave)}</p>
                  </div>
                )}
                {getUserEmail(selectedLeave) && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{getUserEmail(selectedLeave)}</p>
                  </div>
                )}
              </div>

              {selectedLeave.reason && (
                <div className="rounded-lg border p-3 bg-card">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm text-foreground italic">"{selectedLeave.reason}"</p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Leave Calendar</h1>
          <p className="text-muted-foreground">View approved team leaves and schedules</p>
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

      {/* Month Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Leaves ({format(currentDate, 'MMM yyyy')})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{approvedLeaves.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Members on Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{uniqueEmployeesOnLeave}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Leave Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-600">{onLeaveTodayCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
          {/* Leave Type Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-muted-foreground mr-1">Legend:</span>
            <span className="px-2 py-0.5 rounded border bg-blue-100 text-blue-900 border-blue-300 font-medium">CL Casual</span>
            <span className="px-2 py-0.5 rounded border bg-amber-100 text-amber-900 border-amber-300 font-medium">SL Sick</span>
            <span className="px-2 py-0.5 rounded border bg-purple-100 text-purple-900 border-purple-300 font-medium">EL Earned</span>
            <span className="px-2 py-0.5 rounded border bg-emerald-100 text-emerald-900 border-emerald-300 font-medium">Other</span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading leave calendar...</p>
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
                  const isSelected = selectedDate && isSameDay(day.date, selectedDate);
                  const weekend = isWeekend(day.date);
                  const hasLeaves = day.leaves.length > 0;

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={[
                        'min-h-[110px] border rounded-lg p-2 transition-all cursor-pointer flex flex-col justify-between',
                        !day.isCurrentMonth ? 'bg-gray-50/60 text-gray-400' : 'bg-white hover:border-primary/50',
                        isToday ? 'ring-2 ring-blue-500 bg-blue-50/20' : '',
                        isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : '',
                        weekend && day.isCurrentMonth ? 'bg-gray-50/50' : '',
                        hasLeaves && !isSelected ? 'border-blue-200 shadow-xs' : '',
                      ].join(' ')}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-sm font-semibold ${
                            isToday
                              ? 'text-blue-600 bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center -ml-1 -mt-1'
                              : isSelected
                              ? 'text-primary font-bold'
                              : ''
                          }`}
                        >
                          {format(day.date, 'd')}
                        </span>
                        {hasLeaves && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                            {day.leaves.length} on leave
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 mt-1 flex-1">
                        {day.leaves.slice(0, 3).map((leave) => {
                          const name = getUserDisplayName(leave);
                          const code = resolveLeaveTypeCode(leave) || 'LV';
                          return (
                            <div
                              key={leave._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(day.date);
                                setSelectedLeave(leave);
                              }}
                              className={`text-[11px] leading-tight px-1.5 py-1 rounded border flex items-center justify-between gap-1 font-medium truncate transition-all ${getLeaveBadgeStyle(code)}`}
                              title={`${name} — ${resolveLeaveTypeName(leave)} (${leave.totalDays} day${leave.totalDays > 1 ? 's' : ''})`}
                            >
                              <span className="truncate font-semibold">{name}</span>
                              <span className="text-[9px] uppercase font-bold shrink-0 opacity-80 px-1 py-0.2 bg-white/70 rounded">
                                {code}
                              </span>
                            </div>
                          );
                        })}
                        {day.leaves.length > 3 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(day.date);
                            }}
                            className="text-[10px] font-semibold text-primary hover:underline pt-0.5 cursor-pointer"
                          >
                            +{day.leaves.length - 3} more
                          </div>
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

      {/* Selected Date / Details Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {selectedDate
                ? `Leaves on ${format(selectedDate, 'MMMM d, yyyy')}`
                : `All Approved Leaves for ${format(currentDate, 'MMMM yyyy')}`}
            </CardTitle>
            <CardDescription>
              {selectedDate
                ? `Showing employees on approved leave for ${format(selectedDate, 'MMMM d, yyyy')}`
                : `Showing all ${approvedLeaves.length} approved team leaves for ${format(currentDate, 'MMMM yyyy')}`}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {selectedDate && (
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(null)}>
                Clear Date Filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredDetailsLeaves.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDetailsLeaves.map((leave) => {
                const name = getUserDisplayName(leave);
                const email = getUserEmail(leave);
                const empId = getUserEmployeeId(leave);
                const dept = getUserDepartment(leave);
                const leaveTypeName = resolveLeaveTypeName(leave);
                const code = resolveLeaveTypeCode(leave) || 'LV';

                return (
                  <div
                    key={leave._id}
                    onClick={() => setSelectedLeave(leave)}
                    className="p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-base text-foreground">{name}</p>
                        {empId && <p className="text-xs text-muted-foreground">ID: {empId}</p>}
                        {dept && <p className="text-xs text-muted-foreground">{dept}</p>}
                      </div>
                      <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold ${getLeaveBadgeStyle(code)}`}>
                        {leaveTypeName}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs border-t pt-2 text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Duration:</span>
                        <span className="font-semibold text-foreground">
                          {format(new Date(leave.startDate), 'MMM d, yyyy')} — {format(new Date(leave.endDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Days:</span>
                        <span className="font-semibold text-foreground">
                          {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                          {leave.isHalfDay ? ' (Half Day)' : ''}
                        </span>
                      </div>
                      {email && (
                        <div className="flex items-center justify-between truncate">
                          <span>Email:</span>
                          <span className="font-medium text-foreground truncate max-w-[180px]">{email}</span>
                        </div>
                      )}
                    </div>

                    {leave.reason && (
                      <div className="text-xs bg-muted/40 p-2 rounded border text-muted-foreground italic truncate">
                        "{leave.reason}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground border rounded-xl bg-muted/20">
              <User className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <p className="font-semibold text-base">No approved leaves found</p>
              <p className="text-xs mt-1">
                {selectedDate
                  ? `No employees are on approved leave for ${format(selectedDate, 'MMMM d, yyyy')}`
                  : searchQuery
                  ? 'No leaves match your search criteria'
                  : 'No approved team leaves recorded for this month'}
              </p>
              {selectedDate && (
                <Button variant="link" size="sm" onClick={() => setSelectedDate(null)} className="mt-2">
                  View all leaves for {format(currentDate, 'MMMM yyyy')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



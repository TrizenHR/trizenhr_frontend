'use client';

import { useEffect, useState } from 'react';
import { leaveApi, holidayApi, userApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Leave, Attendance, Holiday, User, LeaveStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronLeft, ChevronRight, CalendarRange, Users,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  isSameDay, isWeekend, startOfWeek, endOfWeek,
} from 'date-fns';

type DayInfo = {
  date: Date;
  isCurrentMonth: boolean;
  leaves: { user: User; leave: Leave }[];
  attendances: { user: User; att: Attendance }[];
  holiday?: Holiday;
};

export default function TeamCalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayInfo[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, [currentDate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const currentUserId = user?._id || user?.id;
      if (!currentUserId) return;

      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const year = currentDate.getFullYear();

      const [members, leavesRes, holidaysRes] = await Promise.all([
        // SUPERVISOR (Manager) uses getAllUsers — backend already filters out
        // Admin/HR/SuperAdmin roles for the supervisor requester.
        userApi.getAllUsers({ isActive: true }),
        leaveApi.getAllLeaves({ startDate: monthStart, endDate: monthEnd, status: LeaveStatus.APPROVED }),
        holidayApi.getAll({ year }).catch(() => [] as Holiday[]),
      ]);

      setTeamMembers(members);

      // Build calendar grid
      const calStart = startOfWeek(monthStart);
      const calEnd = endOfWeek(monthEnd);
      const days = eachDayOfInterval({ start: calStart, end: calEnd });

      const grid: DayInfo[] = days.map(date => {
        const dayLeaves = (leavesRes.records || [])
          .filter(l => {
            const s = new Date(l.startDate), e = new Date(l.endDate);
            return date >= s && date <= e;
          })
          .map(l => {
            const u = typeof l.userId === 'object' ? l.userId as any : null;
            const matchedUser = members.find(m => m._id === (u?._id || l.userId));
            return matchedUser ? { user: matchedUser, leave: l } : null;
          })
          .filter(Boolean) as { user: User; leave: Leave }[];

        const dayHoliday = holidaysRes.find(h => isSameDay(new Date(h.date), date));

        return {
          date,
          isCurrentMonth: isSameMonth(date, currentDate),
          leaves: dayLeaves,
          attendances: [],
          holiday: dayHoliday,
        };
      });

      setCalendarDays(grid);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to load team calendar', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1));

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Team Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Combined view of team attendance, leaves, and holidays
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="min-w-[140px] text-center font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { color: 'bg-blue-100 border-blue-300 text-blue-700', label: 'Holiday' },
          { color: 'bg-purple-100 border-purple-300 text-purple-700', label: 'On Leave' },
          { color: 'bg-gray-100 border-gray-300 text-gray-600', label: 'Weekend' },
        ].map(l => (
          <div key={l.label} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${l.color}`}>
            <span className="h-2 w-2 rounded-full bg-current opacity-60" />
            {l.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {teamMembers.length} team members
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <CalendarRange className="mr-2 h-5 w-5 animate-pulse" /> Loading calendar…
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="grid grid-cols-7 border-b">
                {DAYS.map(d => (
                  <div key={d} className="border-r py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground last:border-r-0">
                    {d}
                  </div>
                ))}
              </div>
              {/* Days grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const isToday = isSameDay(day.date, new Date());
                  const isWknd = isWeekend(day.date);
                  const dimmed = !day.isCurrentMonth;

                  return (
                    <div
                      key={idx}
                      className={[
                        'min-h-[90px] border-b border-r p-1.5 last-of-type:border-r-0',
                        dimmed ? 'bg-muted/20 opacity-50' : '',
                        isWknd && !dimmed ? 'bg-gray-50/60 dark:bg-muted/10' : '',
                        day.holiday ? 'bg-blue-50/60 dark:bg-blue-950/20' : '',
                        isToday ? 'ring-2 ring-inset ring-primary/40' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isToday ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground' : dimmed ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {format(day.date, 'd')}
                        </span>
                        {day.holiday && (
                          <span className="text-[9px] font-medium text-blue-600 bg-blue-100 rounded px-1 truncate max-w-[60px]" title={day.holiday.name}>
                            {day.holiday.name}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {day.leaves.slice(0, 3).map(({ user: u, leave }) => (
                          <div key={leave._id} className="truncate rounded bg-purple-100 px-1 py-0.5 text-[10px] font-medium text-purple-700" title={`${u.firstName} ${u.lastName} — On Leave`}>
                            {u.firstName} {u.lastName[0]}.
                          </div>
                        ))}
                        {day.leaves.length > 3 && (
                          <div className="text-[10px] text-muted-foreground">+{day.leaves.length - 3} more</div>
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

      {/* Team list */}
      {teamMembers.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Team Members ({teamMembers.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map(m => (
                <div key={m._id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {m.firstName[0]}{m.lastName[0]}
                  </div>
                  <span className="text-xs font-medium">{m.firstName} {m.lastName}</span>
                  <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { attendanceApi, userApi } from '@/lib/api';
import { Attendance, AttendanceStatus, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { AlertTriangle, Clock, UserX, ArrowDownLeft, ArrowUpRight, Timer, Loader2, RefreshCw } from 'lucide-react';

type ExceptionType = 'missing_checkin' | 'missing_checkout' | 'late_arrival' | 'early_exit' | 'short_hours';

type AttendanceException = {
  type: ExceptionType;
  user: User;
  attendance?: Attendance;
  date: string;
  detail: string;
};

const EXCEPTION_CONFIG: Record<ExceptionType, { label: string; icon: React.ReactNode; color: string; badge: string }> = {
  missing_checkin: { label: 'Missing Check-In', icon: <UserX className="h-4 w-4" />, color: 'text-red-600', badge: 'bg-red-100 text-red-700 border-red-200' },
  missing_checkout: { label: 'Missing Check-Out', icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-orange-600', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  late_arrival: { label: 'Late Arrival', icon: <Clock className="h-4 w-4" />, color: 'text-amber-600', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  early_exit: { label: 'Early Exit', icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-purple-600', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  short_hours: { label: 'Short Hours', icon: <Timer className="h-4 w-4" />, color: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export default function AttendanceExceptionsPage() {
  const { toast } = useToast();
  const [exceptions, setExceptions] = useState<AttendanceException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ExceptionType | 'all'>('all');
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [minHours, setMinHours] = useState('8');

  useEffect(() => { load(); }, [dateFrom, dateTo]);

  const load = async () => {
    try {
      setIsLoading(true);
      const [allUsers, attendanceRes] = await Promise.all([
        userApi.getAllUsers({ isActive: true }),
        attendanceApi.getAllAttendance({
          startDate: startOfDay(new Date(dateFrom)),
          endDate: endOfDay(new Date(dateTo)),
          page: 1, limit: 1000,
        }),
      ]);

      const records = attendanceRes.records;
      const found: AttendanceException[] = [];
      const WORK_START = 9 * 60; // 9:00 AM in minutes
      const GRACE = 15; // 15 min grace
      const EARLY_EXIT_THRESHOLD = 17 * 60; // 5:00 PM
      const minHoursNum = parseFloat(minHours) || 8;

      for (const att of records) {
        const userId = typeof att.userId === 'object' ? (att.userId as any)._id : att.userId;
        const user = allUsers.find(u => u._id === userId);
        if (!user) continue;

        // Missing check-in
        if (!att.checkIn && att.status !== AttendanceStatus.ON_LEAVE) {
          found.push({ type: 'missing_checkin', user, attendance: att, date: att.date, detail: 'No check-in recorded' });
        }
        // Missing check-out
        if (att.checkIn && !att.checkOut && att.status !== AttendanceStatus.ON_LEAVE) {
          found.push({ type: 'missing_checkout', user, attendance: att, date: att.date, detail: 'No check-out recorded' });
        }
        // Late arrival
        if (att.checkIn) {
          const ci = new Date(att.checkIn);
          const mins = ci.getHours() * 60 + ci.getMinutes();
          if (mins > WORK_START + GRACE) {
            const late = mins - WORK_START;
            found.push({ type: 'late_arrival', user, attendance: att, date: att.date, detail: `${Math.floor(late / 60)}h ${late % 60}m late` });
          }
        }
        // Early exit
        if (att.checkOut) {
          const co = new Date(att.checkOut);
          const mins = co.getHours() * 60 + co.getMinutes();
          if (mins < EARLY_EXIT_THRESHOLD) {
            const early = EARLY_EXIT_THRESHOLD - mins;
            found.push({ type: 'early_exit', user, attendance: att, date: att.date, detail: `Left ${Math.floor(early / 60)}h ${early % 60}m early` });
          }
        }
        // Short hours
        if (att.workingHours != null && att.workingHours < minHoursNum && att.checkIn && att.checkOut) {
          found.push({ type: 'short_hours', user, attendance: att, date: att.date, detail: `Only ${att.workingHours.toFixed(1)}h worked (min ${minHoursNum}h)` });
        }
      }

      setExceptions(found);
    } catch {
      toast({ title: 'Error', description: 'Failed to load exceptions', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = activeFilter === 'all' ? exceptions : exceptions.filter(e => e.type === activeFilter);
  const counts: Record<string, number> = { all: exceptions.length };
  for (const t of Object.keys(EXCEPTION_CONFIG) as ExceptionType[]) {
    counts[t] = exceptions.filter(e => e.type === t).length;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Attendance Exceptions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Identify missing check-ins, late arrivals, early exits, and short hours
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} max={dateTo} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To Date</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} min={dateFrom} max={format(new Date(), 'yyyy-MM-dd')} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Min Hours Threshold</Label>
              <Input type="number" min="1" max="12" step="0.5" value={minHours} onChange={e => setMinHours(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={load} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[{ key: 'all', label: 'All', color: 'text-foreground' }, ...Object.entries(EXCEPTION_CONFIG).map(([k, v]) => ({ key: k, label: v.label, color: v.color }))].map(s => (
          <button key={s.key} onClick={() => setActiveFilter(s.key as any)}
            className={`rounded-xl border p-3 text-left transition-all ${activeFilter === s.key ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:bg-muted/40'}`}>
            <p className="text-[11px] font-medium text-muted-foreground truncate">{s.label}</p>
            <p className={`mt-0.5 text-xl font-bold ${s.color}`}>{counts[s.key] ?? 0}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {activeFilter === 'all' ? 'All Exceptions' : EXCEPTION_CONFIG[activeFilter as ExceptionType]?.label}
          </CardTitle>
          <CardDescription>{filtered.length} exception{filtered.length !== 1 ? 's' : ''} found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertTriangle className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">No exceptions found</p>
              <p className="text-sm text-muted-foreground/60 mt-1">All attendance records look clean for this period</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((ex, i) => {
                const cfg = EXCEPTION_CONFIG[ex.type];
                return (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ${cfg.color}`}>{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm">{ex.user.firstName} {ex.user.lastName}</p>
                        <Badge className={`text-[10px] border ${cfg.badge}`}>{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(ex.date), 'EEE, MMM dd, yyyy')} · {ex.detail}
                        {ex.user.department ? ` · ${ex.user.department}` : ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground hidden sm:block">
                      {ex.attendance?.checkIn ? format(new Date(ex.attendance.checkIn), 'hh:mm a') : '—'}
                      {' → '}
                      {ex.attendance?.checkOut ? format(new Date(ex.attendance.checkOut), 'hh:mm a') : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

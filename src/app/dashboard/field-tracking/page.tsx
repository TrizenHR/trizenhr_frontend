'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Clock3,
  ExternalLink,
  History,
  MapPin,
  Navigation,
  RefreshCw,
  Square,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { attendanceApi, fieldTrackingApi, userApi } from '@/lib/api';
import type { FieldLocationPoint, FieldTrackingLiveSession, User } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { hasAnyRole } from '@/lib/permissions';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckInPhotoButton,
  CheckInPhotoDialog,
  type CheckInPhotoTarget,
} from '@/components/attendance/CheckInPhotoDialog';

const FieldTrackingMap = dynamic(
  () =>
    import('@/components/field-tracking/FieldTrackingMap').then((m) => m.FieldTrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-xl border bg-muted/30 text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);

function displayName(session: FieldTrackingLiveSession): string {
  const u = session.user;
  if (!u) return 'Employee';
  if (u.fullName) return u.fullName;
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return name || u.employeeId || u.email || 'Employee';
}

function userLabel(user: User): string {
  const name =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.email;
  return user.employeeId ? `${name} (${user.employeeId})` : name;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function FieldTrackingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  // Company Admin only (same as mobile Attendance Management).
  const canAccess = hasAnyRole((user?.role ?? '') as UserRole, [UserRole.ADMIN]);
  const canForceStop = canAccess;

  const [sessions, setSessions] = useState<FieldTrackingLiveSession[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [forceStoppingId, setForceStoppingId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<User[]>([]);
  const [historyUserId, setHistoryUserId] = useState('');
  const [pathDate, setPathDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [pathPoints, setPathPoints] = useState<FieldLocationPoint[]>([]);
  const [pathLoading, setPathLoading] = useState(false);
  /** True when the selected history still has an active session (no check-out yet). */
  const [historySessionActive, setHistorySessionActive] = useState(false);
  const [checkInPhoto, setCheckInPhoto] = useState<CheckInPhotoTarget | null>(null);
  const [photoTarget, setPhotoTarget] = useState<CheckInPhotoTarget | null>(null);

  const loadLive = useCallback(
    async (silent = false) => {
      if (!silent) setLiveLoading(true);
      try {
        const data = await fieldTrackingApi.getLive();
        setSessions(data);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } }; message?: string };
        if (!silent) {
          toast({
            title: 'Could not load live locations',
            description:
              err.response?.data?.error ||
              err.message ||
              'Field tracking API may not be ready yet.',
            variant: 'destructive',
          });
        }
        setSessions([]);
      } finally {
        if (!silent) setLiveLoading(false);
      }
    },
    [toast]
  );

  // Load once when opening the page — no auto-poll (use Refresh for updates).
  useEffect(() => {
    if (!canAccess) return;
    void loadLive();
  }, [canAccess, loadLive]);

  useEffect(() => {
    if (!canAccess) return;
    void (async () => {
      try {
        const users = await userApi.getAllUsers({ isActive: true });
        const fieldUsers = users.filter((u) => u.fieldTrackingEnabled === true);
        setEmployees(fieldUsers.length > 0 ? fieldUsers : users);
      } catch {
        setEmployees([]);
      }
    })();
  }, [canAccess]);

  const selectedSession = useMemo(
    () => sessions.find((s) => s.sessionId === selectedSessionId) ?? null,
    [sessions, selectedSessionId]
  );

  const historyEmployeeLabel = useMemo(() => {
    if (selectedSession) return displayName(selectedSession);
    if (!historyUserId) return null;
    const emp = employees.find((e) => (e._id || e.id) === historyUserId);
    return emp ? userLabel(emp) : 'Selected employee';
  }, [selectedSession, historyUserId, employees]);

  const resolveCheckInPhoto = useCallback(async () => {
    const userId = selectedSession?.userId || historyUserId;
    if (!userId) {
      setCheckInPhoto(null);
      return;
    }

    try {
      const result = await attendanceApi.getUserAttendance(userId, {
        startDate: pathDate,
        endDate: pathDate,
        page: 1,
        limit: 1,
      });
      const record = result.records[0];
      if (!record || (!record.hasCheckInPhoto && !record.photoUrl && !record.checkIn)) {
        setCheckInPhoto(null);
        return;
      }

      const emp = employees.find((e) => (e._id || e.id) === userId);
      setCheckInPhoto({
        attendanceId: record._id,
        employeeName: selectedSession
          ? displayName(selectedSession)
          : emp
            ? userLabel(emp)
            : undefined,
        date: record.date,
        checkIn: record.checkIn,
      });
    } catch {
      setCheckInPhoto(null);
    }
  }, [selectedSession, historyUserId, pathDate, employees]);

  useEffect(() => {
    void resolveCheckInPhoto();
  }, [resolveCheckInPhoto]);

  const handleViewCheckInPhoto = useCallback(
    (session: FieldTrackingLiveSession) => {
      if (
        checkInPhoto &&
        session.attendanceId &&
        checkInPhoto.attendanceId === session.attendanceId
      ) {
        setPhotoTarget(checkInPhoto);
        return;
      }

      if (session.attendanceId) {
        setPhotoTarget({
          attendanceId: session.attendanceId,
          employeeName: displayName(session),
          date: pathDate,
        });
        return;
      }

      if (checkInPhoto) {
        setPhotoTarget(checkInPhoto);
      }
    },
    [checkInPhoto, pathDate]
  );

  type HistoryEventKind = 'check_in' | 'update' | 'check_out' | 'latest';

  const historyRows = useMemo(() => {
    const chronological = [...pathPoints].sort((a, b) => {
      const ta = new Date(a.recordedAt || 0).getTime();
      const tb = new Date(b.recordedAt || 0).getTime();
      return ta - tb;
    });

    const labeled = chronological.map((point, index) => {
      let event: HistoryEventKind = 'update';
      if (chronological.length === 1 || index === 0) {
        event = 'check_in';
      } else if (index === chronological.length - 1) {
        event = historySessionActive ? 'latest' : 'check_out';
      }
      return { point, event, seq: index + 1 };
    });

    // Newest first for the table.
    return labeled.reverse();
  }, [pathPoints, historySessionActive]);

  function eventLabel(event: HistoryEventKind): string {
    switch (event) {
      case 'check_in':
        return 'Check-in';
      case 'check_out':
        return 'Check-out';
      case 'latest':
        return 'Latest';
      default:
        return 'Location update';
    }
  }

  function eventBadgeClass(event: HistoryEventKind): string {
    switch (event) {
      case 'check_in':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'check_out':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'latest':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-amber-50 text-amber-900 border-amber-200';
    }
  }

  const loadPathForSession = useCallback(
    async (session: FieldTrackingLiveSession, date: string) => {
      setPathLoading(true);
      try {
        // Prefer session path for today's active session; fall back to day path.
        let points: FieldLocationPoint[] = [];
        const today = format(new Date(), 'yyyy-MM-dd');
        if (date === today && session.sessionId) {
          try {
            points = await fieldTrackingApi.getSessionPath(session.sessionId);
          } catch {
            points = [];
          }
        }
        if (points.length === 0 && session.userId) {
          const day = await fieldTrackingApi.getDayPath(session.userId, date);
          points = day.points;
        }
        setPathPoints(points);
        setHistorySessionActive(session.status === 'active');
        if (points.length === 0) {
          toast({
            title: 'No route yet',
            description: 'No location points found for this employee on the selected date.',
          });
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } }; message?: string };
        setPathPoints([]);
        setHistorySessionActive(false);
        toast({
          title: 'Could not load route',
          description:
            err.response?.data?.error ||
            err.message ||
            'Field tracking path API may not be ready yet.',
          variant: 'destructive',
        });
      } finally {
        setPathLoading(false);
      }
    },
    [toast]
  );

  const loadPathForUser = useCallback(
    async (userId: string, date: string) => {
      if (!userId) return;
      setPathLoading(true);
      try {
        const day = await fieldTrackingApi.getDayPath(userId, date);
        setPathPoints(day.points);
        const stillActive = (day.sessions ?? []).some((s) => s.status === 'active');
        setHistorySessionActive(stillActive);
        if (day.points.length === 0) {
          toast({
            title: 'No route yet',
            description: 'No location points found for this employee on the selected date.',
          });
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } }; message?: string };
        setPathPoints([]);
        setHistorySessionActive(false);
        toast({
          title: 'Could not load route',
          description:
            err.response?.data?.error ||
            err.message ||
            'Field tracking path API may not be ready yet.',
          variant: 'destructive',
        });
      } finally {
        setPathLoading(false);
      }
    },
    [toast]
  );

  const handleSelectSession = (session: FieldTrackingLiveSession) => {
    setSelectedSessionId(session.sessionId);
    setHistoryUserId(session.userId || '');
    void loadPathForSession(session, pathDate);
  };

  const handleRefresh = useCallback(async () => {
    await loadLive();
    if (selectedSession) {
      await loadPathForSession(selectedSession, pathDate);
    } else if (historyUserId) {
      await loadPathForUser(historyUserId, pathDate);
    }
  }, [loadLive, selectedSession, historyUserId, pathDate, loadPathForSession, loadPathForUser]);

  // When date changes and someone is selected, reload route on the same map.
  useEffect(() => {
    if (!selectedSession && !historyUserId) return;
    if (selectedSession) {
      void loadPathForSession(selectedSession, pathDate);
      return;
    }
    void loadPathForUser(historyUserId, pathDate);
    // Only react to date changes; selection handlers load path themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathDate]);

  const handleForceStop = async (sessionId: string) => {
    setForceStoppingId(sessionId);
    try {
      const stoppedUserId =
        sessions.find((s) => s.sessionId === sessionId)?.userId || historyUserId;
      await fieldTrackingApi.forceStop(sessionId);
      toast({
        title: 'Live tracking stopped for this employee',
        description:
          'Only this person was removed from the live map. They can resume from the mobile app (Start location tracking). Other employees are not affected.',
      });
      await loadLive();
      // Keep history visible — force-stop does not delete GPS points.
      setSelectedSessionId(null);
      if (stoppedUserId) {
        setHistoryUserId(stoppedUserId);
        await loadPathForUser(stoppedUserId, pathDate);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast({
        title: 'Force stop failed',
        description: err.response?.data?.error || err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setForceStoppingId(null);
    }
  };

  const handleHistoryUserChange = (userId: string) => {
    setHistoryUserId(userId);
    setSelectedSessionId(null);
    void loadPathForUser(userId, pathDate);
  };

  const clearRoute = () => {
    setSelectedSessionId(null);
    setHistoryUserId('');
    setPathPoints([]);
    setHistorySessionActive(false);
  };

  if (!canAccess) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Field Tracking</CardTitle>
            <CardDescription>You do not have permission to view field tracking.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <CheckInPhotoDialog target={photoTarget} onClose={() => setPhotoTarget(null)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Field Tracking</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Live locations and travel routes on one map. Employees check in from the mobile app
              with location permission. This page does not auto-update — use Refresh after check-in.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                sessions.length > 0 ? 'bg-emerald-500' : 'bg-muted-foreground/40'
              )}
            />
            {sessions.length} live
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={liveLoading || pathLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${liveLoading || pathLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Field map
            </CardTitle>
            <CardDescription>
              Loads when you open this page. Use Refresh for the latest locations. Click an employee
              to show their route on this map.
              {pathLoading ? ' Loading route…' : null}
              {pathPoints.length > 0
                ? ` Showing ${pathPoints.length} point${pathPoints.length === 1 ? '' : 's'}.`
                : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {liveLoading && sessions.length === 0 ? (
              <div className="flex h-[520px] items-center justify-center rounded-xl border bg-muted/30 text-sm text-muted-foreground">
                Loading live locations…
              </div>
            ) : (
              <FieldTrackingMap
                sessions={sessions}
                pathPoints={pathPoints}
                selectedSessionId={selectedSessionId}
                routeDate={pathDate}
                onSelectSession={handleSelectSession}
                onViewCheckInPhoto={handleViewCheckInPhoto}
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Active sessions
              </CardTitle>
              <CardDescription>
                {sessions.length} employee{sessions.length === 1 ? '' : 's'} currently tracked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessions.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  No active sessions. Enable field tracking on the employee&apos;s profile, have them
                  check in from the <strong>mobile app</strong> with location allowed, then click
                  Refresh.
                </div>
              ) : (
                sessions.map((session) => {
                  const active = selectedSessionId === session.sessionId;
                  const name = displayName(session);
                  return (
                    <button
                      key={session.sessionId}
                      type="button"
                      onClick={() => handleSelectSession(session)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors',
                        active
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'hover:border-border hover:bg-muted/40'
                      )}
                    >
                      <div className="relative">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initialsOf(name)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {session.lastLocation?.recordedAt
                            ? `Last update ${new Date(
                                session.lastLocation.recordedAt
                              ).toLocaleTimeString()}`
                            : 'Waiting for location…'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}

              {selectedSession ? (
                <div className="mt-1 rounded-lg border bg-muted/20 p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <p className="text-sm font-semibold">{displayName(selectedSession)}</p>
                  </div>
                  {selectedSession.lastLocation ? (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {selectedSession.lastLocation.latitude.toFixed(5)},{' '}
                      {selectedSession.lastLocation.longitude.toFixed(5)}
                    </p>
                  ) : null}
                  {checkInPhoto ? (
                    <CheckInPhotoButton
                      attendanceId={checkInPhoto.attendanceId}
                      employeeName={checkInPhoto.employeeName}
                      date={checkInPhoto.date}
                      checkIn={checkInPhoto.checkIn}
                      onView={setPhotoTarget}
                      className="mt-3 w-full"
                    />
                  ) : null}
                  {canForceStop ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2 w-full"
                      disabled={forceStoppingId === selectedSession.sessionId}
                      onClick={() => void handleForceStop(selectedSession.sessionId)}
                    >
                      <Square className="mr-2 h-3.5 w-3.5 shrink-0" />
                      Stop live tracking
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-primary" />
                Location history
              </CardTitle>
              <CardDescription>
                Pick an employee and date. Route draws on the map; points list below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={historyUserId} onValueChange={handleHistoryUserChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => {
                      const id = emp._id || emp.id;
                      return (
                        <SelectItem key={id} value={id}>
                          {userLabel(emp)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={pathDate}
                  onChange={(e) => setPathDate(e.target.value)}
                />
              </div>
              {pathPoints.length > 0 || historyUserId || selectedSessionId ? (
                <Button variant="outline" size="sm" className="w-full" onClick={clearRoute}>
                  Clear history
                </Button>
              ) : null}
              {checkInPhoto && !selectedSession ? (
                <CheckInPhotoButton
                  attendanceId={checkInPhoto.attendanceId}
                  employeeName={checkInPhoto.employeeName}
                  date={checkInPhoto.date}
                  checkIn={checkInPhoto.checkIn}
                  onView={setPhotoTarget}
                  className="w-full"
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock3 className="h-4 w-4 text-primary" />
            Location history log
          </CardTitle>
          <CardDescription>
            {pathLoading
              ? 'Loading location points…'
              : historyEmployeeLabel
                ? `${historyEmployeeLabel} · ${pathDate} · ${pathPoints.length} point${
                    pathPoints.length === 1 ? '' : 's'
                  }`
                : 'Select an active session or an employee and date to view GPS history.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pathLoading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Loading history…
            </div>
          ) : pathPoints.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              No location history for this selection yet. Points appear after the mobile app uploads
              GPS updates.
            </div>
          ) : (
            <div className="max-h-[420px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead className="hidden sm:table-cell">Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyRows.map(({ point, event, seq }) => {
                    const recorded = point.recordedAt
                      ? new Date(point.recordedAt)
                      : null;
                    const received = point.receivedAt ? new Date(point.receivedAt) : null;
                    return (
                      <TableRow
                        key={point._id || `${point.recordedAt}-${seq}`}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="text-muted-foreground">{seq}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={eventBadgeClass(event)}
                          >
                            {eventLabel(event)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium">
                          {recorded && !Number.isNaN(recorded.getTime())
                            ? recorded.toLocaleString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://www.google.com/maps?q=${point.latitude},${point.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
                          >
                            {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </a>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {typeof point.accuracy === 'number'
                            ? `${Math.round(point.accuracy)} m`
                            : '—'}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                          {received && !Number.isNaN(received.getTime())
                            ? received.toLocaleTimeString()
                            : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

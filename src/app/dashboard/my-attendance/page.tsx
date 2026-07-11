'use client';

import { useEffect, useRef, useState } from 'react';
import { attendanceApi } from '@/lib/api';
import { Attendance, AttendancePolicySummary, AttendanceStatus, AttendanceStats, PolicyDayType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AttendanceStatsCard,
  AttendanceTable,
  AttendanceFilters,
  AttendanceRegularizationPanel,
} from '@/components/attendance';
import { useCamera } from '@/hooks/useCamera';
import { Camera, X, Check, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { formatWorkingHours } from '@/lib/format';

/** Returns a live "Xh Ym" string counting up from checkInTime, or null when not active. */
function useLiveElapsed(checkInTime: string | null | undefined, active: boolean): string | null {
  const [display, setDisplay] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active || !checkInTime) {
      setDisplay(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const update = () => {
      const diffMs = Date.now() - new Date(checkInTime).getTime();
      const totalMins = Math.floor(diffMs / 60000);
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      setDisplay(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);
    };

    update();
    timerRef.current = setInterval(update, 60000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, checkInTime]);

  return display;
}

function formatTimeLabel(time?: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, 'hh:mm a');
}

function formatExpectedHours(hours?: number): string {
  if (hours == null || Number.isNaN(hours)) return '0h';
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded}h`;
}

function getCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
}

export default function MyAttendancePage() {
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [policySummary, setPolicySummary] = useState<AttendancePolicySummary | null>(null);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);

  // History & Stats state
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<{
    startDate: Date | null;
    endDate: Date | null;
    status: AttendanceStatus | null;
  }>({
    startDate: null,
    endDate: null,
    status: null,
  });

  const {
    photoData,
    error: cameraError,
    isCameraActive,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    reset: resetCamera,
  } = useCamera();

  const { toast } = useToast();

  // Fetch today's status on mount
  useEffect(() => {
    loadTodayStatus();
    loadPolicySummary();
  }, []);

  // Load attendance history when filters or pagination changes
  useEffect(() => {
    loadAttendanceHistory();
  }, [pagination.page, filters]);

  // Load monthly stats when month/year changes
  useEffect(() => {
    loadMonthlyStats();
  }, [selectedMonth, selectedYear]);

  // Start camera when showCamera is true
  useEffect(() => {
    if (showCamera && !isCameraActive) {
      startCamera().then((stream) => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }).catch((err) => {
        console.error('Camera error:', err);
        
        // More user-friendly error messages
        let errorMessage = 'Failed to start camera';
        if (err.message.includes('permission') || err.message.includes('denied')) {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (err.message.includes('not found')) {
          errorMessage = 'No camera found. Please ensure your device has a working camera.';
        } else if (err.message.includes('in use')) {
          errorMessage = 'Camera is already in use by another application.';
        }
        
        toast({
          title: 'Camera Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setShowCamera(false);
      });
    }

    return () => {
      if (!showCamera) {
        stopCamera();
      }
    };
  }, [showCamera, isCameraActive, startCamera, stopCamera, videoRef, toast]);

  const loadTodayStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const status = await attendanceApi.getTodayStatus();
      setTodayAttendance(status);
    } catch (error: any) {
      console.error('Failed to load today status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const loadPolicySummary = async () => {
    try {
      setIsLoadingPolicy(true);
      const summary = await attendanceApi.getMyPolicy();
      setPolicySummary(summary);
    } catch (error: any) {
      console.error('Failed to load policy summary:', error);
    } finally {
      setIsLoadingPolicy(false);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await attendanceApi.getMyAttendance({
        page: pagination.page,
        limit: pagination.limit,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: filters.status || undefined,
      });
      
      setAttendanceRecords(response.records || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      });
    } catch (error: any) {
      console.error('Failed to load attendance history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance history',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      setIsLoadingStats(true);
      const monthStats = await attendanceApi.getMyStats(selectedMonth + 1, selectedYear);
      setStats(monthStats);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleFilterChange = (newFilters: {
    startDate: Date | null;
    endDate: Date | null;
    status: AttendanceStatus | null;
  }) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleCheckIn = () => {
    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    const photo = capturePhoto();
    if (photo) {
      setShowCamera(false);
      stopCamera();
      const coords = await getCurrentPosition();
      submitCheckIn(photo, coords?.latitude, coords?.longitude);
    }
  };

  const submitCheckIn = async (photo: string, latitude?: number, longitude?: number) => {
    try {
      setIsCheckingIn(true);
      const attendance = await attendanceApi.checkIn(photo, latitude, longitude);
      setTodayAttendance(attendance);
      await Promise.all([loadMonthlyStats(), loadAttendanceHistory()]);
      resetCamera();
      
      // Check if photo was successfully uploaded
      if (attendance.photoUrl) {
        // Full success - check-in with photo
        toast({
          title: 'Check-in Successful',
          description: `Checked in at ${format(new Date(attendance.checkIn!), 'hh:mm a')} with photo`,
        });
      } else {
        // Partial success - check-in succeeded but photo upload failed
        toast({
          title: 'Check-in Successful',
          description: `Checked in at ${format(new Date(attendance.checkIn!), 'hh:mm a')}. Note: Photo upload failed but your attendance was recorded.`,
          variant: 'default', // Still success, just a warning note
        });
      }
    } catch (error: any) {
      // Complete failure - check-in failed entirely
      const errorMessage = error.response?.data?.error || error.message || 'Failed to check in';
      
      toast({
        title: 'Check-in Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Log full error for debugging
      console.error('Check-in error:', {
        message: errorMessage,
        fullError: error,
        response: error.response?.data,
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true);
      const coords = await getCurrentPosition();
      const attendance = await attendanceApi.checkOut(coords?.latitude, coords?.longitude);
      setTodayAttendance(attendance);
      setShowCheckoutModal(false);
      await Promise.all([loadMonthlyStats(), loadAttendanceHistory()]);
      
      toast({
        title: 'Check-out Successful',
        description: `Checked out at ${format(new Date(attendance.checkOut!), 'hh:mm a')}. Working hours: ${formatWorkingHours(attendance.workingHours || 0)}`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to check out';
      
      toast({
        title: 'Check-out Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Log for debugging
      console.error('Check-out error:', {
        message: errorMessage,
        fullError: error,
        response: error.response?.data,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCancelCamera = () => {
    setShowCamera(false);
    stopCamera();
    resetCamera();
  };

  const hasCheckedIn = todayAttendance?.checkIn != null;
  const hasCheckedOut = todayAttendance?.checkOut != null;

  // Live elapsed timer — only ticks while checked in and NOT yet checked out
  const liveElapsed = useLiveElapsed(
    todayAttendance?.checkIn,
    hasCheckedIn && !hasCheckedOut
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground text-sm md:text-base">Track your attendance and working hours</p>
      </div>

      {/* Today's Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Today&#39;s Status</CardTitle>
          <CardDescription>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStatus ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Status Display */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  {!hasCheckedIn ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-400" />
                      <span className="text-sm font-medium">Not Checked In</span>
                    </div>
                  ) : !hasCheckedOut ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium text-green-600">Checked In</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium text-blue-600">Completed</span>
                    </div>
                  )}
                </div>

                {todayAttendance?.status && (
                  <Badge variant={todayAttendance.status === 'present' ? 'default' : 'secondary'}>
                    {todayAttendance.status?.replace('_', ' ').toUpperCase() ?? ''}
                  </Badge>
                )}
              </div>

              {/* Policy Summary */}
              {!isLoadingPolicy && policySummary && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">
                      {policySummary.dayType === PolicyDayType.WEEKLY_OFF
                        ? 'Weekly Off'
                        : policySummary.dayType === PolicyDayType.HALF_DAY
                        ? 'Half Day'
                        : 'Full Day'}
                    </div>
                    {policySummary.policyName && (
                      <Badge variant="outline">{policySummary.policyName}</Badge>
                    )}
                  </div>
                  {policySummary.dayType !== PolicyDayType.WEEKLY_OFF && (
                    <div className="mt-2 flex flex-wrap gap-3 text-muted-foreground">
                      <span>
                        {formatTimeLabel(policySummary.startTime)} -{' '}
                        {formatTimeLabel(policySummary.endTime)}
                      </span>
                      <span>Expected {formatExpectedHours(policySummary.expectedHours)}</span>
                      {policySummary.graceMinutes != null && (
                        <span>Grace {policySummary.graceMinutes}m</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Time Information */}
              {todayAttendance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Check In</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {todayAttendance.checkIn
                          ? format(new Date(todayAttendance.checkIn), 'hh:mm a')
                          : 'Not checked in'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Check Out</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {todayAttendance.checkOut
                          ? format(new Date(todayAttendance.checkOut), 'hh:mm a')
                          : 'Not checked out'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Working Hours</p>
                    <p className="text-sm font-medium">
                      {hasCheckedOut && todayAttendance.workingHours != null
                        ? formatWorkingHours(todayAttendance.workingHours)
                        : hasCheckedIn
                        ? (liveElapsed ?? '0m')
                        : 'Not started'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {!hasCheckedIn ? (
                  <Button onClick={handleCheckIn} disabled={isCheckingIn} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                ) : !hasCheckedOut ? (
                  <Button onClick={() => setShowCheckoutModal(true)} disabled={isCheckingOut} className="flex-1">
                    <Check className="mr-2 h-4 w-4" />
                    Check Out
                  </Button>
                ) : (
                  <div className="flex-1 text-center text-sm text-muted-foreground py-2">
                    You&#39;ve completed today&#39;s attendance
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Take Your Photo</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCancelCamera}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Please face the camera and take a clear photo for attendance verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Video Preview */}
                {!photoData ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <img src={photoData} alt="Captured" className="w-full h-full object-cover" />
                  </div>
                )}

                {cameraError && (
                  <p className="text-sm text-red-500 text-center">{cameraError}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCancelCamera} className="flex-1">
                    Cancel
                  </Button>
                  {!photoData ? (
                    <Button onClick={handleTakePhoto} className="flex-1">
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        resetCamera();
                        startCamera().then((stream) => {
                          if (videoRef.current && stream) {
                            videoRef.current.srcObject = stream;
                            videoRef.current.play();
                          }
                        });
                      }}
                      className="flex-1"
                    >
                      Retake Photo
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AttendanceRegularizationPanel />

      {/* Monthly Statistics */}
      <AttendanceStatsCard
        stats={stats}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        isLoading={isLoadingStats}
      />

      {/* Attendance History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>View and filter your past attendance records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <AttendanceFilters onFilterChange={handleFilterChange} />

          {/* History Table */}
          <AttendanceTable
            records={attendanceRecords}
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoadingHistory}
          />
        </CardContent>
      </Card>

      {/* Checkout Confirmation Modal */}
      {showCheckoutModal && (() => {
        const checkInTime = todayAttendance?.checkIn
          ? format(new Date(todayAttendance.checkIn), 'hh:mm a')
          : null;
        const currentTime = format(new Date(), 'hh:mm a');
        const totalMinutes = todayAttendance?.checkIn
          ? Math.floor((Date.now() - new Date(todayAttendance.checkIn).getTime()) / 60000)
          : 0;
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMins = totalMinutes % 60;
        const totalHoursDisplay =
          totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins}m`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-card">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <h2 className="text-lg font-bold text-foreground">Confirm Check Out</h2>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Time Summary */}
              <div className="grid grid-cols-3 gap-3 px-6 pt-5">
                <div className="rounded-xl bg-muted/40 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Checked In
                  </p>
                  <p className="mt-1.5 text-base font-bold text-foreground">{checkInTime || '—'}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Check Out
                  </p>
                  <p className="mt-1.5 text-base font-bold text-primary">{currentTime}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Hours
                  </p>
                  <p className="mt-1.5 text-base font-bold text-green-600">{totalHoursDisplay}</p>
                </div>
              </div>

              {/* Warning */}
              <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-sm text-amber-700">
                  Once you check out, you cannot check in again today.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 px-6 py-5">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                  disabled={isCheckingOut}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={isCheckingOut}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing…
                    </span>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Check Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

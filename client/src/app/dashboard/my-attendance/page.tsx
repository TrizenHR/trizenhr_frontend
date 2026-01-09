'use client';

import { useEffect, useState } from 'react';
import { attendanceApi } from '@/lib/api';
import { Attendance, AttendanceStatus, AttendanceStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatsCard, AttendanceTable, AttendanceFilters } from '@/components/attendance';
import { useCamera } from '@/hooks/useCamera';
import { Camera, X, Check, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { formatWorkingHours } from '@/lib/format';

export default function MyAttendancePage() {
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

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

  const loadAttendanceHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await attendanceApi.getMyAttendance({
        page: pagination.page,
        limit: pagination.limit,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
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

  const handleTakePhoto = () => {
    const photo = capturePhoto();
    if (photo) {
      // Photo captured successfully
      setShowCamera(false);
      stopCamera();
      // Proceed with check-in
      submitCheckIn(photo);
    }
  };

  const submitCheckIn = async (photo: string) => {
    try {
      setIsCheckingIn(true);
      const attendance = await attendanceApi.checkIn(photo);
      setTodayAttendance(attendance);
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
      const attendance = await attendanceApi.checkOut();
      setTodayAttendance(attendance);
      
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">Track your attendance and working hours</p>
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

                {todayAttendance && (
                  <Badge variant={todayAttendance.status === 'present' ? 'default' : 'secondary'}>
                    {todayAttendance.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                )}
              </div>

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
                      {todayAttendance.workingHours
                        ? formatWorkingHours(todayAttendance.workingHours)
                        : 'In progress...'}
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
                  <Button onClick={handleCheckOut} disabled={isCheckingOut} className="flex-1">
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
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { attendanceApi, departmentApi, userApi, leaveApi } from '@/lib/api';
import { Attendance, AttendanceStatus, Department, User, Leave } from '@/lib/types';
import { resolveLeaveTypeName, getLeaveStatusLabel } from '@/lib/leave-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Download, Filter, X, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatAttendanceDate, formatTimeOnly } from '@/lib/date-utils';
import { formatWorkingHours } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import {
  CheckInPhotoDialog,
  AttendancePhotoButtons,
  type CheckInPhotoTarget,
} from '@/components/attendance/CheckInPhotoDialog';
import { AttendancePunchCell, punchExportLabel } from '@/components/attendance/AttendancePunchCell';

type AttendanceReportsTabProps = {
  showLocationColumns?: boolean;
};

export default function AttendanceReportsTab({
  showLocationColumns = false,
}: AttendanceReportsTabProps) {
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [photoTarget, setPhotoTarget] = useState<CheckInPhotoTarget | null>(null);

  // Summary stats
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
  });

  // Load departments and users on mount
  useEffect(() => {
    loadDepartments();
    loadUsers();
  }, []);

  // Load attendance when filters or pagination changes
  useEffect(() => {
    loadAttendance();
  }, [pagination.page, startDate, endDate, selectedStatus, selectedDepartment, selectedUser]);

  const loadDepartments = async () => {
    try {
      const depts = await departmentApi.getAll();
      setDepartments(depts);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load departments',
        variant: 'destructive',
      });
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await userApi.getAllUsers({ isActive: true });
      setUsers(allUsers);
    } catch (error: any) {
      // Silently fail
    }
  };

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedDepartment !== 'all') filters.department = selectedDepartment;
      if (selectedUser !== 'all') filters.userId = selectedUser;

      const result = await attendanceApi.getAllAttendance(filters);
      setAttendanceRecords(result.records);
      setPagination(result.pagination);

      // Calculate summary
      const stats = {
        total: result.records.length,
        present: result.records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
        late: result.records.filter((r) => r.status === AttendanceStatus.LATE).length,
        absent: result.records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
        halfDay: result.records.filter((r) => r.status === AttendanceStatus.HALF_DAY).length,
        onLeave: result.records.filter((r) => r.status === AttendanceStatus.ON_LEAVE).length,
      };
      setSummary(stats);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load attendance records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const filters: any = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedDepartment !== 'all') filters.department = selectedDepartment;
      if (selectedUser !== 'all') filters.userId = selectedUser;
      filters.limit = 10000;

      const attendancePromise =
        selectedUser !== 'all'
          ? attendanceApi.getUserAttendance(selectedUser, {
              startDate: filters.startDate,
              endDate: filters.endDate,
              status: filters.status,
              page: 1,
              limit: 10000,
            })
          : attendanceApi.getAllAttendance({ ...filters, includeImpliedAbsents: true });

      const [attendanceResult, leaveResult] = await Promise.all([
        attendancePromise,
        leaveApi.getAllLeaves(filters),
      ]);

      exportToCSV(attendanceResult.records, leaveResult.records);

      toast({
        title: 'Export Started',
        description: `Your combined report is being downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = (attendanceRecords: Attendance[], leaveRecords: Leave[]) => {
    const statusLabels: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: 'Present',
      [AttendanceStatus.LATE]: 'Late',
      [AttendanceStatus.ABSENT]: 'Absent',
      [AttendanceStatus.HALF_DAY]: 'Half Day',
      [AttendanceStatus.ON_LEAVE]: 'On Leave',
      [AttendanceStatus.WEEKLY_OFF]: 'Weekly Off',
      [AttendanceStatus.HOLIDAY]: 'Holiday',
      [AttendanceStatus.NOT_JOINED]: 'Not Joined',
      [AttendanceStatus.PRESENT_WITH_LATE]: 'Present with Late',
    };

    const headers = [
      'Type',
      'Date',
      'Employee Name',
      'Employee ID',
      'Department',
      'Check In',
      'Check Out',
      'Attendance Status',
      'Working Hours',
      'Leave Type',
      'Leave Start Date',
      'Leave End Date',
      'Total Days',
      'Leave Status',
      'Reason',
    ];

    const attendanceRows = attendanceRecords
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((record) => {
        const user = typeof record.userId === 'object' ? record.userId : null;
        return [
          'Attendance',
          formatAttendanceDate(record.date),
          user ? `${user.firstName} ${user.lastName}` : 'N/A',
          user?.employeeId || 'N/A',
          user?.department || 'N/A',
        showLocationColumns
          ? punchExportLabel(
              record.checkIn,
              record.checkInLocationLabel,
              record.checkInLat,
              record.checkInLng,
              true
            )
          : record.checkIn
            ? formatTimeOnly(record.checkIn)
            : 'N/A',
        showLocationColumns
          ? punchExportLabel(
              record.checkOut,
              record.checkOutLocationLabel,
              record.checkOutLat,
              record.checkOutLng,
              true
            )
          : record.checkOut
            ? formatTimeOnly(record.checkOut)
            : 'N/A',
        statusLabels[record.status],
        record.workingHours ? formatWorkingHours(record.workingHours) : 'N/A',
        '',
        '',
        '',
        '',
        '',
      ];
    });

    const leaveRows = leaveRecords.map((record) => {
      const user = typeof record.userId === 'object' ? record.userId : null;
      return [
        'Leave',
        '',
        user ? `${user.firstName} ${user.lastName}` : 'N/A',
        user?.employeeId || 'N/A',
        user?.department || 'N/A',
        '',
        '',
        '',
        '',
        resolveLeaveTypeName(record),
        formatAttendanceDate(record.startDate),
        formatAttendanceDate(record.endDate),
        record.totalDays.toString(),
        getLeaveStatusLabel(record.status),
        record.reason || 'N/A',
      ];
    });

    const allRows = [...attendanceRows, ...leaveRows] as string[][];
    const parseCsvDate = (value: string) => {
      const time = Date.parse(value);
      return Number.isNaN(time) ? 0 : time;
    };
    allRows.sort((a, b) => {
      const dateA = parseCsvDate(a[1] || '');
      const dateB = parseCsvDate(b[1] || '');
      if (dateA !== dateB) return dateB - dateA;
      return String(a[2] || '').localeCompare(String(b[2] || ''));
    });

    const csvContent = [
      headers.join(','),
      ...allRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `combined-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedStatus('all');
    setSelectedDepartment('all');
    setSelectedUser('all');
    setSearchQuery('');
    setPagination({ ...pagination, page: 1 });
  };

  const hasActiveFilters = startDate || endDate || selectedStatus !== 'all' || selectedDepartment !== 'all' || selectedUser !== 'all';

  // Filter records by search query (client-side)
  const filteredRecords = searchQuery
    ? attendanceRecords.filter((record) => {
        const user = typeof record.userId === 'object' ? record.userId : null;
        const name = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : '';
        const empId = user?.employeeId?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || empId.includes(query);
      })
    : attendanceRecords;

  const getStatusBadge = (status: AttendanceStatus) => {
    const config: Partial<Record<
      AttendanceStatus,
      { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
    >> = {
      [AttendanceStatus.PRESENT]: { label: 'Present', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', icon: CheckCircle2 },
      [AttendanceStatus.ABSENT]: { label: 'Absent', className: 'bg-rose-500/10 text-rose-700 border-rose-500/20', icon: XCircle },
      [AttendanceStatus.ON_LEAVE]: { label: 'On Leave', className: 'bg-purple-500/10 text-purple-700 border-purple-500/20', icon: CalendarIcon },
      [AttendanceStatus.HALF_DAY]: { label: 'Half Day', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', icon: Clock },
      [AttendanceStatus.LATE]: { label: 'Late', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: Clock },
    };

    const item = config[status] || { label: status, className: 'bg-slate-500/10 text-slate-700 border-slate-500/20', icon: AlertCircle };
    const Icon = item.icon;
    return (
      <Badge variant="outline" className={cn("px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit shadow-none gap-1", item.className)}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {item.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <CheckInPhotoDialog target={photoTarget} onClose={() => setPhotoTarget(null)} />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Records</CardDescription>
            <CardTitle className="text-2xl">{pagination.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Present</CardDescription>
            <CardTitle className="text-2xl text-green-600">{summary.present}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Late</CardDescription>
            <CardTitle className="text-2xl text-orange-600">{summary.late}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Absent</CardDescription>
            <CardTitle className="text-2xl text-red-600">{summary.absent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Half Day</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{summary.halfDay}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>On Leave</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{summary.onLeave}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadAttendance()}>
                Apply
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Date Range */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date) => setStartDate(date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate || undefined}
                    onSelect={(date) => setEndDate(date || null)}
                    disabled={(date) => (startDate ? date < startDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as AttendanceStatus | 'all')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={AttendanceStatus.PRESENT}>Present</SelectItem>
                  <SelectItem value={AttendanceStatus.LATE}>Late</SelectItem>
                  <SelectItem value={AttendanceStatus.ABSENT}>Absent</SelectItem>
                  <SelectItem value={AttendanceStatus.HALF_DAY}>Half Day</SelectItem>
                  <SelectItem value={AttendanceStatus.ON_LEAVE}>On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Employee</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {users.map((user) => {
                    const uid = user._id || user.id;
                    return (
                      <SelectItem key={uid} value={uid}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
              <label className="text-xs text-muted-foreground">Search</label>
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={() => handleExport('csv')} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {pagination.total} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No attendance records found</div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Date</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Employee</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Check In</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Check Out</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Status</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Working Hours</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Photos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const user = typeof record.userId === 'object' ? record.userId : null;
                      const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'EE';

                      return (
                        <TableRow key={record._id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="whitespace-nowrap font-medium text-muted-foreground py-4">
                            <div className="flex items-center gap-1.5 text-xs">
                              <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              {formatAttendanceDate(record.date)}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {user ? (
                              <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-xs font-semibold text-primary shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-foreground leading-tight">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px] truncate" title={user.email}>
                                    {user.email}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    {user.employeeId && (
                                      <span className="text-[10px] text-muted-foreground/80 font-mono">ID: {user.employeeId}</span>
                                    )}
                                    {user.employeeId && user.department && <span className="text-[10px] text-muted-foreground/40">•</span>}
                                    {user.department && (
                                      <span className="text-[10px] text-muted-foreground/80">{user.department}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <AttendancePunchCell
                              time={record.checkIn}
                              latitude={record.checkInLat}
                              longitude={record.checkInLng}
                              locationLabel={record.checkInLocationLabel}
                              showLocation={showLocationColumns}
                            />
                          </TableCell>
                          <TableCell className="py-4">
                            <AttendancePunchCell
                              time={record.checkOut}
                              latitude={record.checkOutLat}
                              longitude={record.checkOutLng}
                              locationLabel={record.checkOutLocationLabel}
                              showLocation={showLocationColumns}
                            />
                          </TableCell>
                          <TableCell className="py-4 whitespace-nowrap">
                            {getStatusBadge(record.status)}
                          </TableCell>
                          <TableCell className="py-4 whitespace-nowrap text-sm">
                            {record.workingHours ? formatWorkingHours(record.workingHours) : '-'}
                          </TableCell>
                          <TableCell className="py-4">
                            <AttendancePhotoButtons
                              attendanceId={record._id}
                              employeeName={
                                user ? `${user.firstName} ${user.lastName}` : undefined
                              }
                              date={record.date}
                              checkIn={record.checkIn}
                              checkOut={record.checkOut}
                              hasCheckInPhoto={record.hasCheckInPhoto}
                              hasCheckOutPhoto={record.hasCheckOutPhoto}
                              photoUrl={record.photoUrl}
                              checkOutPhotoUrl={record.checkOutPhotoUrl}
                              onView={setPhotoTarget}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

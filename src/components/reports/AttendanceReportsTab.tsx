'use client';

import { useState, useEffect } from 'react';
import { attendanceApi, departmentApi } from '@/lib/api';
import { Attendance, AttendanceStatus, Department } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Download, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatAttendanceDate, formatTimeOnly } from '@/lib/date-utils';
import { formatWorkingHours } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'bg-green-100 text-green-800',
  [AttendanceStatus.LATE]: 'bg-orange-100 text-orange-800',
  [AttendanceStatus.ABSENT]: 'bg-red-100 text-red-800',
  [AttendanceStatus.HALF_DAY]: 'bg-yellow-100 text-yellow-800',
  [AttendanceStatus.ON_LEAVE]: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'Present',
  [AttendanceStatus.LATE]: 'Late',
  [AttendanceStatus.ABSENT]: 'Absent',
  [AttendanceStatus.HALF_DAY]: 'Half Day',
  [AttendanceStatus.ON_LEAVE]: 'On Leave',
};

export default function AttendanceReportsTab() {
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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
  const [searchQuery, setSearchQuery] = useState('');

  // Summary stats
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
  });

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Load attendance when filters or pagination changes
  useEffect(() => {
    loadAttendance();
  }, [pagination.page, startDate, endDate, selectedStatus, selectedDepartment]);

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
      // Fetch all records for export (no pagination)
      const filters: any = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedDepartment !== 'all') filters.department = selectedDepartment;
      filters.limit = 10000; // Large limit to get all records

      const result = await attendanceApi.getAllAttendance(filters);
      const allRecords = result.records;

      if (format === 'csv') {
        exportToCSV(allRecords);
      } else {
        // For Excel, we'll use CSV format (can be enhanced with a library like xlsx)
        exportToCSV(allRecords);
      }

      toast({
        title: 'Export Started',
        description: `Your attendance report is being downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = (records: Attendance[]) => {
    const headers = ['Date', 'Employee Name', 'Employee ID', 'Department', 'Check In', 'Check Out', 'Status', 'Working Hours'];
    const rows = records.map((record) => {
      const user = typeof record.userId === 'object' ? record.userId : null;
      return [
        formatAttendanceDate(record.date),
        user ? `${user.firstName} ${user.lastName}` : 'N/A',
        user?.employeeId || 'N/A',
        user?.department || 'N/A',
        record.checkIn ? formatTimeOnly(record.checkIn) : 'N/A',
        record.checkOut ? formatTimeOnly(record.checkOut) : 'N/A',
        statusLabels[record.status],
        record.workingHours ? formatWorkingHours(record.workingHours) : 'N/A',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
    setSearchQuery('');
    setPagination({ ...pagination, page: 1 });
  };

  const hasActiveFilters = startDate || endDate || selectedStatus !== 'all' || selectedDepartment !== 'all';

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

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="min-w-[120px]">Employee</TableHead>
                      <TableHead className="min-w-[100px]">Employee ID</TableHead>
                      <TableHead className="min-w-[120px]">Department</TableHead>
                      <TableHead className="min-w-[100px]">Check In</TableHead>
                      <TableHead className="min-w-[100px]">Check Out</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Working Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const user = typeof record.userId === 'object' ? record.userId : null;
                      return (
                        <TableRow key={record._id}>
                          <TableCell className="whitespace-nowrap">{formatAttendanceDate(record.date)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {user ? `${user.firstName} ${user.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{user?.employeeId || 'N/A'}</TableCell>
                          <TableCell className="whitespace-nowrap">{user?.department || 'N/A'}</TableCell>
                          <TableCell className="whitespace-nowrap">{record.checkIn ? formatTimeOnly(record.checkIn) : '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">{record.checkOut ? formatTimeOnly(record.checkOut) : '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge className={statusColors[record.status]}>
                              {statusLabels[record.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {record.workingHours ? formatWorkingHours(record.workingHours) : '-'}
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

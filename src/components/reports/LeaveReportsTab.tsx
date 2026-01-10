'use client';

import { useState, useEffect } from 'react';
import { leaveApi, departmentApi, userApi } from '@/lib/api';
import { Leave, LeaveStatus, LeaveType, Department, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatAttendanceDate } from '@/lib/date-utils';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [LeaveStatus.APPROVED]: 'bg-green-100 text-green-800',
  [LeaveStatus.REJECTED]: 'bg-red-100 text-red-800',
  [LeaveStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'Pending',
  [LeaveStatus.APPROVED]: 'Approved',
  [LeaveStatus.REJECTED]: 'Rejected',
  [LeaveStatus.CANCELLED]: 'Cancelled',
};

const leaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.SICK]: 'Sick Leave',
  [LeaveType.CASUAL]: 'Casual Leave',
  [LeaveType.VACATION]: 'Vacation Leave',
  [LeaveType.UNPAID]: 'Unpaid Leave',
};

export default function LeaveReportsTab() {
  const { toast } = useToast();
  const [leaveRecords, setLeaveRecords] = useState<Leave[]>([]);
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
  const [selectedStatus, setSelectedStatus] = useState<LeaveStatus | 'all'>('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Summary stats
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    totalDays: 0,
  });

  // Load departments and users on mount
  useEffect(() => {
    loadDepartments();
    loadUsers();
  }, []);

  // Load leaves when filters or pagination changes
  useEffect(() => {
    loadLeaves();
  }, [pagination.page, startDate, endDate, selectedStatus, selectedLeaveType, selectedDepartment, selectedUser]);

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
      const allUsers = await userApi.getAllUsers();
      setUsers(allUsers);
    } catch (error: any) {
      // Silently fail - not critical
    }
  };

  const loadLeaves = async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedLeaveType !== 'all') filters.leaveType = selectedLeaveType;
      if (selectedUser !== 'all') filters.userId = selectedUser;

      const result = await leaveApi.getAllLeaves(filters);
      setLeaveRecords(result.records);
      setPagination(result.pagination);

      // Calculate summary
      const stats = {
        total: result.records.length,
        pending: result.records.filter((r) => r.status === LeaveStatus.PENDING).length,
        approved: result.records.filter((r) => r.status === LeaveStatus.APPROVED).length,
        rejected: result.records.filter((r) => r.status === LeaveStatus.REJECTED).length,
        cancelled: result.records.filter((r) => r.status === LeaveStatus.CANCELLED).length,
        totalDays: result.records.reduce((sum, r) => sum + r.totalDays, 0),
      };
      setSummary(stats);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load leave records',
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
      if (selectedLeaveType !== 'all') filters.leaveType = selectedLeaveType;
      if (selectedDepartment !== 'all') {
        // Filter by department - need to get users in that department first
        // const deptUsers = users.filter((u) => u.department === selectedDepartment);
        // Note: This is a limitation - we'd need backend support for department filtering
      }
      if (selectedUser !== 'all') filters.userId = selectedUser;
      filters.limit = 10000; // Large limit to get all records

      const result = await leaveApi.getAllLeaves(filters);
      const allRecords = result.records;

      if (format === 'csv') {
        exportToCSV(allRecords);
      } else {
        exportToCSV(allRecords);
      }

      toast({
        title: 'Export Started',
        description: `Your leave report is being downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = (records: Leave[]) => {
    const headers = [
      'Employee Name',
      'Employee ID',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Total Days',
      'Status',
      'Reason',
      'Applied On',
      'Reviewed By',
      'Reviewed On',
    ];
    const rows = records.map((record) => {
      const user = typeof record.userId === 'object' ? record.userId : null;
      const reviewer = typeof record.reviewedBy === 'object' ? record.reviewedBy : null;
      return [
        user ? `${user.firstName} ${user.lastName}` : 'N/A',
        user?.employeeId || 'N/A',
        user?.department || 'N/A',
        leaveTypeLabels[record.leaveType],
        formatAttendanceDate(record.startDate),
        formatAttendanceDate(record.endDate),
        record.totalDays.toString(),
        statusLabels[record.status],
        record.reason || 'N/A',
        formatAttendanceDate(record.createdAt),
        reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'N/A',
        record.reviewedAt ? formatAttendanceDate(record.reviewedAt) : 'N/A',
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
    link.setAttribute('download', `leave-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedStatus('all');
    setSelectedLeaveType('all');
    setSelectedDepartment('all');
    setSelectedUser('all');
    setSearchQuery('');
    setPagination({ ...pagination, page: 1 });
  };

  const hasActiveFilters =
    startDate || endDate || selectedStatus !== 'all' || selectedLeaveType !== 'all' || selectedDepartment !== 'all' || selectedUser !== 'all';

  // Filter records by search query (client-side)
  const filteredRecords = searchQuery
    ? leaveRecords.filter((record) => {
        const user = typeof record.userId === 'object' ? record.userId : null;
        const name = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : '';
        const empId = user?.employeeId?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || empId.includes(query) || record.reason?.toLowerCase().includes(query);
      })
    : leaveRecords;

  // Filter by department (client-side)
  const departmentFilteredRecords =
    selectedDepartment !== 'all'
      ? filteredRecords.filter((record) => {
          const user = typeof record.userId === 'object' ? record.userId : null;
          return user?.department === selectedDepartment;
        })
      : filteredRecords;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-2xl">{pagination.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{summary.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-2xl text-green-600">{summary.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-2xl text-red-600">{summary.rejected}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cancelled</CardDescription>
            <CardTitle className="text-2xl text-gray-600">{summary.cancelled}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Days</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{summary.totalDays}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadLeaves()}>
                Apply
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as LeaveStatus | 'all')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={LeaveStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={LeaveStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={LeaveStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={LeaveStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leave Type Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Leave Type</label>
              <Select value={selectedLeaveType} onValueChange={(v) => setSelectedLeaveType(v as LeaveType | 'all')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={LeaveType.SICK}>Sick Leave</SelectItem>
                  <SelectItem value={LeaveType.CASUAL}>Casual Leave</SelectItem>
                  <SelectItem value={LeaveType.VACATION}>Vacation Leave</SelectItem>
                  <SelectItem value={LeaveType.UNPAID}>Unpaid Leave</SelectItem>
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
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
              <label className="text-xs text-muted-foreground">Search</label>
              <Input
                placeholder="Search by name, ID, or reason..."
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

      {/* Leave Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Records</CardTitle>
          <CardDescription>
            Showing {departmentFilteredRecords.length} of {pagination.total} records
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
          ) : departmentFilteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No leave records found</div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Employee</TableHead>
                      <TableHead className="min-w-[100px]">Employee ID</TableHead>
                      <TableHead className="min-w-[120px]">Department</TableHead>
                      <TableHead className="min-w-[100px]">Leave Type</TableHead>
                      <TableHead className="min-w-[100px]">Start Date</TableHead>
                      <TableHead className="min-w-[100px]">End Date</TableHead>
                      <TableHead className="min-w-[60px]">Days</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[150px]">Reason</TableHead>
                      <TableHead className="min-w-[100px]">Applied On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentFilteredRecords.map((record) => {
                      const user = typeof record.userId === 'object' ? record.userId : null;
                      return (
                        <TableRow key={record._id}>
                          <TableCell className="whitespace-nowrap">
                            {user ? `${user.firstName} ${user.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{user?.employeeId || 'N/A'}</TableCell>
                          <TableCell className="whitespace-nowrap">{user?.department || 'N/A'}</TableCell>
                          <TableCell className="whitespace-nowrap">{leaveTypeLabels[record.leaveType]}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatAttendanceDate(record.startDate)}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatAttendanceDate(record.endDate)}</TableCell>
                          <TableCell className="whitespace-nowrap">{record.totalDays}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge className={statusColors[record.status]}>
                              {statusLabels[record.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{record.reason || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatAttendanceDate(record.createdAt)}</TableCell>
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

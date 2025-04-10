
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { LeaveSummary } from '@/components/LeaveSummary';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileText, Check, X, Eye, Calendar, ChevronDown, Download, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { mockLeaveRequests, mockLeaveBalances, getLeaveHistory, getTeamOverlaps, LeaveRequest } from '@/services/mockLeaveData';
import { toast } from '@/hooks/use-toast';

const LeaveApprovals: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [viewLeave, setViewLeave] = useState<LeaveRequest | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openRemarkDialog, setOpenRemarkDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionRemark, setActionRemark] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Filter leaves based on current filters
  const filteredLeaves = mockLeaveRequests.filter(leave => {
    // Filter by tab
    if (selectedTab !== "all" && leave.status.toLowerCase() !== selectedTab.toLowerCase()) {
      return false;
    }
    
    // Filter by search query
    if (
      searchQuery &&
      !leave.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !leave.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by department
    if (departmentFilter !== "all" && leave.department !== departmentFilter) {
      return false;
    }
    
    // Filter by leave type
    if (leaveTypeFilter !== "all" && leave.leaveType !== leaveTypeFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all" && leave.status !== statusFilter) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.from && dateRange.to) {
      const leaveStart = new Date(leave.fromDate);
      const leaveEnd = new Date(leave.toDate);
      if (
        !(leaveStart <= dateRange.to && leaveEnd >= dateRange.from)
      ) {
        return false;
      }
    }
    
    return true;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setLeaveTypeFilter("all");
    setStatusFilter("all");
    setDateRange({ from: undefined, to: undefined });
  };

  const handleViewLeave = (leave: LeaveRequest) => {
    setViewLeave(leave);
    setOpenViewDialog(true);
  };

  const handleLeaveAction = (leave: LeaveRequest, action: 'approve' | 'reject') => {
    setViewLeave(leave);
    setActionType(action);
    setOpenRemarkDialog(true);
  };

  const confirmAction = () => {
    if (!viewLeave || !actionType || !actionRemark) return;
    
    // In a real app, this would make an API call
    // For demo purposes, we just show a toast
    const actionText = actionType === 'approve' ? 'approved' : 'rejected';
    toast({
      title: `Leave ${actionText} successfully`,
      description: `${viewLeave.employeeName}'s leave request has been ${actionText}.`,
    });
    
    setOpenRemarkDialog(false);
    setActionType(null);
    setActionRemark("");
    setViewLeave(null);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
  };

  // Get leave type badge color
  const getLeaveTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sick':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{type}</Badge>;
      case 'casual':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">{type}</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{type}</Badge>;
      case 'unpaid':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{type}</Badge>;
      case 'maternity':
        return <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">{type}</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{type}</Badge>;
    }
  };

  // Unique departments for filter
  const departments = Array.from(new Set(mockLeaveRequests.map(leave => leave.department)));
  
  // Unique leave types for filter
  const leaveTypes = Array.from(new Set(mockLeaveRequests.map(leave => leave.leaveType)));

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/leave-approvals">Leave Approvals</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Leave Approvals</h1>
          </div>

          {/* Summary Cards */}
          <LeaveSummary />

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Search by employee name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Leave Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {leaveTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range || { from: undefined, to: undefined });
                    if (range?.to) setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={resetFilters} className="ml-auto">
              Reset Filters
            </Button>
          </div>

          {/* Tabs and Table */}
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All Leaves</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No leave requests found matching your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell className="font-medium">{leave.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {leave.employeeName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{leave.employeeName}</div>
                                <div className="text-xs text-muted-foreground">{leave.employeeId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{leave.department}</TableCell>
                          <TableCell>{getLeaveTypeBadge(leave.leaveType)}</TableCell>
                          <TableCell>{format(new Date(leave.fromDate), "MMM dd, yyyy")}</TableCell>
                          <TableCell>{format(new Date(leave.toDate), "MMM dd, yyyy")}</TableCell>
                          <TableCell>{leave.days}</TableCell>
                          <TableCell>{getStatusBadge(leave.status)}</TableCell>
                          <TableCell>{format(new Date(leave.appliedOn), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleViewLeave(leave)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {leave.status === 'Pending' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleLeaveAction(leave, 'approve')}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleLeaveAction(leave, 'reject')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Leave Details Dialog */}
      {viewLeave && (
        <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription>
                Review the leave request details below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Employee Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {viewLeave.employeeName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{viewLeave.employeeName}</h3>
                  <p className="text-sm text-muted-foreground">{viewLeave.employeeId} · {viewLeave.department}</p>
                </div>
              </div>
              
              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Leave Type</p>
                  <p className="font-medium">{getLeaveTypeBadge(viewLeave.leaveType)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p>{getStatusBadge(viewLeave.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">From Date</p>
                  <p className="font-medium">{format(new Date(viewLeave.fromDate), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To Date</p>
                  <p className="font-medium">{format(new Date(viewLeave.toDate), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Days</p>
                  <p className="font-medium">{viewLeave.days} day(s)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applied On</p>
                  <p className="font-medium">{format(new Date(viewLeave.appliedOn), "MMMM dd, yyyy")}</p>
                </div>
              </div>
              
              {/* Leave Balance */}
              {mockLeaveBalances[viewLeave.employeeId] && mockLeaveBalances[viewLeave.employeeId][viewLeave.leaveType] && (
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Leave Balance</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Allocated</p>
                      <p className="font-medium">
                        {mockLeaveBalances[viewLeave.employeeId][viewLeave.leaveType].total} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Used</p>
                      <p className="font-medium">
                        {mockLeaveBalances[viewLeave.employeeId][viewLeave.leaveType].used} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="font-medium">
                        {mockLeaveBalances[viewLeave.employeeId][viewLeave.leaveType].balance} days
                      </p>
                    </div>
                  </div>
                  
                  {/* Warning if requested days exceed balance */}
                  {viewLeave.days > mockLeaveBalances[viewLeave.employeeId][viewLeave.leaveType].balance && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">
                        Warning: Requested days exceed available balance
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Reason */}
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium mb-2">Reason</h4>
                <p className="text-sm">{viewLeave.reason}</p>
              </div>
              
              {/* Attachment if available */}
              {viewLeave.attachmentUrl && (
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Attachment</h4>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <a 
                      href={viewLeave.attachmentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Attachment
                    </a>
                    <Button variant="outline" size="sm" className="ml-auto">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Team Overlaps */}
              {viewLeave.department && (
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Team Overlaps</h4>
                  <div className="text-sm">
                    {getTeamOverlaps(viewLeave.department, viewLeave.fromDate, viewLeave.toDate)
                      .filter(l => l.id !== viewLeave.id) // Exclude current leave
                      .length > 0 ? (
                      <div className="space-y-2">
                        {getTeamOverlaps(viewLeave.department, viewLeave.fromDate, viewLeave.toDate)
                          .filter(l => l.id !== viewLeave.id)
                          .map(overlap => (
                            <div key={overlap.id} className="flex items-center justify-between">
                              <span>{overlap.employeeName}</span>
                              <div className="flex items-center">
                                <span className="text-xs text-muted-foreground mr-2">
                                  {format(new Date(overlap.fromDate), "MMM dd")} - {format(new Date(overlap.toDate), "MMM dd")}
                                </span>
                                {getStatusBadge(overlap.status)}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No team members on leave during this period</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Leave History */}
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium mb-2">Leave History</h4>
                <div className="text-sm">
                  {getLeaveHistory(viewLeave.employeeId).length > 0 ? (
                    <div className="space-y-2">
                      {getLeaveHistory(viewLeave.employeeId)
                        .filter(h => h.id !== viewLeave.id) // Exclude current leave
                        .slice(0, 3) // Just show 3 most recent
                        .map(history => (
                          <div key={history.id} className="flex items-center justify-between">
                            <div>
                              <span>{history.leaveType}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({format(new Date(history.fromDate), "MMM dd")} - {format(new Date(history.toDate), "MMM dd")})
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground mr-2">
                                {format(new Date(history.appliedOn), "MMM dd, yyyy")}
                              </span>
                              {getStatusBadge(history.status)}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No previous leave history</p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {viewLeave.status === 'Pending' && (
                <>
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => {
                      setOpenViewDialog(false);
                      handleLeaveAction(viewLeave, 'reject');
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setOpenViewDialog(false);
                      handleLeaveAction(viewLeave, 'approve');
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              {viewLeave.status !== 'Pending' && (
                <Button variant="outline" onClick={() => setOpenViewDialog(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approve/Reject Dialog */}
      {viewLeave && (
        <Dialog open={openRemarkDialog} onOpenChange={setOpenRemarkDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve' 
                  ? 'Add any remarks or comments for approving this leave request.' 
                  : 'Please provide a reason for rejecting this leave request.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {viewLeave.employeeName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{viewLeave.employeeName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {viewLeave.leaveType} Leave · {format(new Date(viewLeave.fromDate), "MMM dd")} - {format(new Date(viewLeave.toDate), "MMM dd")}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="remarks" className="text-sm font-medium">
                  {actionType === 'approve' ? 'Remarks (Optional)' : 'Reason for Rejection'}
                </label>
                <textarea
                  id="remarks"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder={actionType === 'approve' 
                    ? "Add any remarks or special instructions..." 
                    : "Please provide a reason for rejecting this leave request..."}
                  value={actionRemark}
                  onChange={(e) => setActionRemark(e.target.value)}
                  required={actionType === 'reject'}
                />
                {actionType === 'reject' && !actionRemark && (
                  <p className="text-sm text-red-500">A reason is required for rejection</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenRemarkDialog(false)}>
                Cancel
              </Button>
              <Button 
                disabled={actionType === 'reject' && !actionRemark}
                className={actionType === 'approve' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                onClick={confirmAction}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'} Leave
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default LeaveApprovals;

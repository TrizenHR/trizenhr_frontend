
import React, { useState } from 'react';
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Download, Eye, Home, Users, PlusCircle, Calendar, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RequestSummary } from "@/components/RequestSummary";
import { useToast } from "@/hooks/use-toast";
import { mockRequests } from "@/services/mockRequestData";

// Status badge mapping
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Request type icon mapping
const getRequestTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'wfh':
      return <Home className="h-4 w-4 text-blue-500" />;
    case 'shift change':
      return <Clock className="h-4 w-4 text-purple-500" />;
    case 'od':
      return <Users className="h-4 w-4 text-indigo-500" />;
    case 'attendance regularization':
      return <Calendar className="h-4 w-4 text-orange-500" />;
    default:
      return <PlusCircle className="h-4 w-4 text-gray-500" />;
  }
};

const RequestApprovals: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined
  });
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [viewingRequest, setViewingRequest] = useState<any | null>(null);
  const [isRemarksOpen, setIsRemarksOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [remarks, setRemarks] = useState('');
  const { toast } = useToast();

  // Filter requests based on current filters
  const filteredRequests = mockRequests.filter(request => {
    // Filter by tab (request type)
    if (selectedTab !== 'all' && request.type.toLowerCase() !== selectedTab.toLowerCase()) {
      return false;
    }
    
    // Filter by search term (name or ID)
    if (searchTerm && !(
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false;
    }
    
    // Filter by status
    if (statusFilter && request.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    
    // Filter by department
    if (departmentFilter && request.department.toLowerCase() !== departmentFilter.toLowerCase()) {
      return false;
    }
    
    // Filter by type
    if (typeFilter && request.type.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }
    
    // Filter by date range
    if (dateRange?.from) {
      const requestDate = new Date(request.requestedFor.from);
      if (dateRange.from && requestDate < dateRange.from) {
        return false;
      }
      if (dateRange.to && requestDate > dateRange.to) {
        return false;
      }
    }
    
    return true;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDepartmentFilter('');
    setTypeFilter('');
    setDateRange(undefined);
  };

  const handleViewRequest = (request: any) => {
    setViewingRequest(request);
  };

  const handleActionClick = (requestId: string, action: 'approve' | 'reject') => {
    setActionType(action);
    setIsRemarksOpen(true);
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedRequests.length === 0) {
      toast({
        title: "No requests selected",
        description: "Please select at least one request to perform this action.",
        variant: "destructive",
      });
      return;
    }
    
    setActionType(action);
    setIsRemarksOpen(true);
  };

  const submitAction = () => {
    if (!remarks.trim()) {
      toast({
        title: "Remarks required",
        description: "Please provide remarks for this action.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would be an API call
    toast({
      title: `Request${selectedRequests.length > 1 ? 's' : ''} ${actionType === 'approve' ? 'approved' : 'rejected'}`,
      description: `Successfully ${actionType === 'approve' ? 'approved' : 'rejected'} ${selectedRequests.length || 1} request${selectedRequests.length > 1 ? 's' : ''}.`,
    });
    
    setIsRemarksOpen(false);
    setRemarks('');
    setSelectedRequests([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(filteredRequests.map(request => request.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const toggleRequestSelection = (requestId: string) => {
    if (selectedRequests.includes(requestId)) {
      setSelectedRequests(selectedRequests.filter(id => id !== requestId));
    } else {
      setSelectedRequests([...selectedRequests, requestId]);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Request and Approvals</h1>
        </div>

        {/* Summary Widgets */}
        <RequestSummary />
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <Input
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="wfh">Work From Home</SelectItem>
                  <SelectItem value="shift change">Shift Change</SelectItem>
                  <SelectItem value="od">On-Duty</SelectItem>
                  <SelectItem value="attendance regularization">Attendance Regularization</SelectItem>
                  <SelectItem value="late arrival">Late Arrival</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <DatePickerWithRange
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
            <Button>Apply Filters</Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="w-full bg-white p-0 border rounded">
            <TabsTrigger value="all" className="flex-1">All Requests</TabsTrigger>
            <TabsTrigger value="wfh" className="flex-1">Work From Home</TabsTrigger>
            <TabsTrigger value="shift change" className="flex-1">Shift Change</TabsTrigger>
            <TabsTrigger value="od" className="flex-1">On-Duty</TabsTrigger>
            <TabsTrigger value="attendance regularization" className="flex-1">Regularization</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bulk Actions */}
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            <Checkbox 
              checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="ml-2 text-sm">
              Select All ({filteredRequests.length})
            </label>
          </div>
          
          {selectedRequests.length > 0 && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Reject Selected ({selectedRequests.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to reject {selectedRequests.length} request(s). This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleBulkAction('reject')}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={() => handleBulkAction('approve')} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approve Selected ({selectedRequests.length})
              </Button>
            </div>
          )}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>List of employee requests</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Requested For</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={() => toggleRequestSelection(request.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <div>{request.employeeName}</div>
                        <div className="text-xs text-gray-500">{request.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRequestTypeIcon(request.type)}
                        <span>{request.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>
                      {request.requestedFor.from}
                      {request.requestedFor.to && ` to ${request.requestedFor.to}`}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={request.reason}>
                      {request.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewRequest(request)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'Pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleActionClick(request.id, 'approve')}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleActionClick(request.id, 'reject')}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6">
                    No requests found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Request Details Modal */}
      {viewingRequest && (
        <Dialog open={!!viewingRequest} onOpenChange={() => setViewingRequest(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription>
                Request ID: {viewingRequest.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employee</h3>
                  <p className="text-base">{viewingRequest.employeeName}</p>
                  <p className="text-sm text-gray-500">{viewingRequest.employeeId}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="text-base">{viewingRequest.department}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Request Type</h3>
                  <div className="flex items-center gap-1 text-base">
                    {getRequestTypeIcon(viewingRequest.type)}
                    <span>{viewingRequest.type}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">{getStatusBadge(viewingRequest.status)}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Requested For</h3>
                  <p className="text-base">
                    {viewingRequest.requestedFor.from}
                    {viewingRequest.requestedFor.to && ` to ${viewingRequest.requestedFor.to}`}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Request Date</h3>
                  <p className="text-base">{viewingRequest.requestDate}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reason</h3>
                  <p className="text-base">{viewingRequest.reason}</p>
                </div>
                
                {viewingRequest.attachment && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Attachment</h3>
                    <Button variant="outline" className="mt-1 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Attachment
                    </Button>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Actions History</h3>
                  <div className="mt-1 border rounded divide-y">
                    {viewingRequest.history?.map((item: any, i: number) => (
                      <div key={i} className="p-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.action}</span>
                          <span className="text-gray-500">{item.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{item.by}</span>
                          {item.remarks && <span>"{item.remarks}"</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {viewingRequest.status === 'Pending' && (
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => {
                      setViewingRequest(null);
                      setTimeout(() => handleActionClick(viewingRequest.id, 'reject'), 100);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setViewingRequest(null);
                      setTimeout(() => handleActionClick(viewingRequest.id, 'approve'), 100);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Remarks Dialog */}
      <Dialog open={isRemarksOpen} onOpenChange={setIsRemarksOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} {selectedRequests.length > 0 ? `${selectedRequests.length} Requests` : 'Request'}
            </DialogTitle>
            <DialogDescription>
              Please provide remarks for this action. This will be visible in the request history.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="remarks" className="text-sm font-medium">
              Remarks
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Enter your remarks here..."
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemarksOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAction} className={actionType === 'approve' ? '' : 'bg-red-600 hover:bg-red-700'}>
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RequestApprovals;

'use client';

import { useEffect, useState } from 'react';
import { leaveApi, userApi } from '@/lib/api';
import { Leave, LeaveStatus, User } from '@/lib/types';
import {
  getLeaveStatusLabel,
  getLeaveStatusVariant,
  isLeaveAwaitingApproval,
  resolveLeaveTypeName,
} from '@/lib/leave-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Search,
  SlidersHorizontal,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

type ActionType = 'approve' | 'reject' | null;
type RequestFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface MockBalance {
  userId: string;
  user: User;
  sickLeave: { total: number; used: number; remaining: number };
  casualLeave: { total: number; used: number; remaining: number };
  vacationLeave: { total: number; used: number; remaining: number };
}

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [actionableLeaveIds, setActionableLeaveIds] = useState<Set<string>>(new Set());
  const [mockBalances, setMockBalances] = useState<MockBalance[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('requests');
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceSearch, setBalanceSearch] = useState('');

  // Dialog state for approving/rejecting leave
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog state for editing balance
  const [selectedBalanceUser, setSelectedBalanceUser] = useState<MockBalance | null>(null);
  const [editBalanceForm, setEditBalanceForm] = useState({
    sickLeave: 12,
    casualLeave: 10,
    vacationLeave: 15,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadAllLeaves();
    loadAllUsers();
    loadActionableLeaves();
  }, []);

  const loadActionableLeaves = async () => {
    try {
      const response = await leaveApi.getPendingLeaves();
      setActionableLeaveIds(new Set(response.records.map((leave) => leave._id)));
    } catch {
      // Non-approvers may not have access; leave set empty
      setActionableLeaveIds(new Set());
    }
  };

  const loadAllLeaves = async () => {
    try {
      setIsLoadingLeaves(true);
      const response = await leaveApi.getAllLeaves();
      setLeaves(response.records);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load leave records',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const allUsers = await userApi.getAllUsers({ isActive: true });
      
      // Initialize mock balances for these users
      const balances: MockBalance[] = allUsers.map((u, index) => ({
        userId: u._id || u.id,
        user: u,
        sickLeave: { total: 12, used: index % 3, remaining: 12 - (index % 3) },
        casualLeave: { total: 10, used: index % 2, remaining: 10 - (index % 2) },
        vacationLeave: { total: 15, used: index % 4, remaining: 15 - (index % 4) },
      }));
      setMockBalances(balances);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load employees for leave balances',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleApprove = (leave: Leave) => {
    setSelectedLeave(leave);
    setActionType('approve');
    setReviewNotes('');
  };

  const handleReject = (leave: Leave) => {
    setSelectedLeave(leave);
    setActionType('reject');
    setReviewNotes('');
  };

  const handleSubmitAction = async () => {
    if (!selectedLeave || !actionType) return;

    if (actionType === 'reject' && !reviewNotes.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (actionType === 'approve') {
        await leaveApi.approveLeave(selectedLeave._id, reviewNotes || undefined);
        toast({
          title: 'Success',
          description: 'Leave request approved',
        });
      } else {
        await leaveApi.rejectLeave(selectedLeave._id, reviewNotes);
        toast({
          title: 'Rejected',
          description: 'Leave request rejected',
        });
      }

      setSelectedLeave(null);
      setActionType(null);
      setReviewNotes('');
      loadAllLeaves();
      loadActionableLeaves();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.response?.data?.error || 'Failed to process leave request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenBalanceEdit = (item: MockBalance) => {
    setSelectedBalanceUser(item);
    setEditBalanceForm({
      sickLeave: item.sickLeave.total,
      casualLeave: item.casualLeave.total,
      vacationLeave: item.vacationLeave.total,
    });
  };

  const handleSaveBalance = () => {
    if (!selectedBalanceUser) return;
    
    // Update local mock balances state
    setMockBalances(prev =>
      prev.map(b => {
        if (b.userId === selectedBalanceUser.userId) {
          return {
            ...b,
            sickLeave: {
              ...b.sickLeave,
              total: editBalanceForm.sickLeave,
              remaining: editBalanceForm.sickLeave - b.sickLeave.used,
            },
            casualLeave: {
              ...b.casualLeave,
              total: editBalanceForm.casualLeave,
              remaining: editBalanceForm.casualLeave - b.casualLeave.used,
            },
            vacationLeave: {
              ...b.vacationLeave,
              total: editBalanceForm.vacationLeave,
              remaining: editBalanceForm.vacationLeave - b.vacationLeave.used,
            },
          };
        }
        return b;
      })
    );

    toast({
      title: 'Local Update Complete',
      description: 'Leave balance updated. Backend integration pending.',
    });
    setSelectedBalanceUser(null);
  };

  // Filter requests
  const filteredLeaves = leaves.filter((leave) => {
    let matchesStatus = true;
    if (requestFilter === 'pending') {
      matchesStatus = isLeaveAwaitingApproval(leave.status);
    } else if (requestFilter === 'approved') {
      matchesStatus = leave.status === LeaveStatus.APPROVED;
    } else if (requestFilter === 'rejected') {
      matchesStatus = leave.status === LeaveStatus.REJECTED;
    }

    let empName = 'Unknown';
    if (typeof leave.userId === 'object' && leave.userId) {
      empName = `${leave.userId.firstName || ''} ${leave.userId.lastName || ''}`.toLowerCase();
    }
    const matchesSearch =
      empName.includes(searchTerm.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Filter balances
  const filteredBalances = mockBalances.filter(b => {
    const fullName = `${b.user.firstName || ''} ${b.user.lastName || ''}`.toLowerCase();
    const empId = (b.user.employeeId || '').toLowerCase();
    const dept = (b.user.department || '').toLowerCase();
    const search = balanceSearch.toLowerCase();
    return fullName.includes(search) || empId.includes(search) || dept.includes(search);
  });

  // Quick stats
  const totalPending = leaves.filter((l) => isLeaveAwaitingApproval(l.status)).length;
  const totalApproved = leaves.filter((l) => l.status === LeaveStatus.APPROVED).length;
  const totalRejected = leaves.filter((l) => l.status === LeaveStatus.REJECTED).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Leave Operations</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve leaves and manage employee leave balances</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 border-amber-500/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending Actions</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-amber-700">{totalPending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Leave requests requiring review</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50/20 to-emerald-500/5 border-emerald-500/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Approved Leaves</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-emerald-700">{totalApproved}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Leaves approved in this cycle</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50/20 to-rose-500/5 border-rose-500/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-rose-600">Rejected Leaves</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-rose-700">{totalRejected}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Leaves rejected or cancelled</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/80">
          <TabsTrigger value="requests" className="font-semibold">Leave Requests</TabsTrigger>
          <TabsTrigger value="balances" className="font-semibold">Leave Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Request History</CardTitle>
                  <CardDescription>Review and action leave applications</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search employee or reason..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={requestFilter === 'pending' ? 'default' : 'outline'}
                      onClick={() => setRequestFilter('pending')}
                      size="sm"
                      className="gap-1.5"
                    >
                      Pending
                      {totalPending > 0 && (
                        <Badge variant="secondary" className="px-1.5 py-0 h-5 bg-amber-500 text-white font-bold">
                          {totalPending}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant={requestFilter === 'approved' ? 'default' : 'outline'}
                      onClick={() => setRequestFilter('approved')}
                      size="sm"
                    >
                      Approved
                      {totalApproved > 0 && (
                        <Badge variant="secondary" className="px-1.5 py-0 h-5">
                          {totalApproved}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant={requestFilter === 'rejected' ? 'default' : 'outline'}
                      onClick={() => setRequestFilter('rejected')}
                      size="sm"
                    >
                      Rejected
                      {totalRejected > 0 && (
                        <Badge variant="secondary" className="px-1.5 py-0 h-5">
                          {totalRejected}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant={requestFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setRequestFilter('all')}
                      size="sm"
                    >
                      All
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLeaves ? (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                  Loading leaves...
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaves.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No leave requests found matching filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeaves.map((leave) => (
                          <TableRow key={leave._id} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                  {typeof leave.userId === 'object' && leave.userId
                                    ? `${leave.userId.firstName?.[0] || ''}${leave.userId.lastName?.[0] || ''}`
                                    : 'UN'}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {typeof leave.userId === 'object' && leave.userId
                                      ? `${leave.userId.firstName || ''} ${leave.userId.lastName || ''}`
                                      : 'Unknown'}
                                  </p>
                                  {typeof leave.userId === 'object' && leave.userId?.employeeId && (
                                    <p className="text-xs text-muted-foreground">{leave.userId.employeeId}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{resolveLeaveTypeName(leave)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {format(new Date(leave.startDate), 'dd MMM')} - {format(new Date(leave.endDate), 'dd MMM, yyyy')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{leave.totalDays}</span>
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={leave.reason}>{leave.reason}</TableCell>
                            <TableCell>
                              <Badge variant={getLeaveStatusVariant(leave.status)}>
                                {getLeaveStatusLabel(leave.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {isLeaveAwaitingApproval(leave.status) ? (
                                actionableLeaveIds.has(leave._id) ? (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApprove(leave)}
                                    className="text-green-600 border-green-200 hover:text-green-700 hover:bg-green-50/50"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(leave)}
                                    className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50/50"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                                ) : (
                                  <Badge variant="outline" className="text-xs font-normal">
                                    Awaiting prior approval
                                  </Badge>
                                )
                              ) : (
                                <span className="text-xs text-muted-foreground font-medium">Reviewed</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Employee Leave Balances</CardTitle>
                  <CardDescription>View, adjust, and audit employee leave allotments</CardDescription>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name, ID, or department..."
                    className="pl-9"
                    value={balanceSearch}
                    onChange={e => setBalanceSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                  Loading balances...
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Sick Leave</TableHead>
                        <TableHead>Casual Leave</TableHead>
                        <TableHead>Vacation Leave</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBalances.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No employees found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBalances.map((item) => (
                          <TableRow key={item.userId} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                  {item.user.firstName?.[0] || ''}{item.user.lastName?.[0] || ''}
                                </div>
                                <div>
                                  <p className="font-medium">{item.user.firstName} {item.user.lastName}</p>
                                  <p className="text-xs text-muted-foreground">{item.user.employeeId || 'No ID'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {item.user.department || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">{item.sickLeave.remaining} <span className="text-xs font-normal text-muted-foreground">/ {item.sickLeave.total} left</span></p>
                                <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.sickLeave.remaining / item.sickLeave.total) * 100}%` }} />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">{item.casualLeave.remaining} <span className="text-xs font-normal text-muted-foreground">/ {item.casualLeave.total} left</span></p>
                                <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(item.casualLeave.remaining / item.casualLeave.total) * 100}%` }} />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">{item.vacationLeave.remaining} <span className="text-xs font-normal text-muted-foreground">/ {item.vacationLeave.total} left</span></p>
                                <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(item.vacationLeave.remaining / item.vacationLeave.total) * 100}%` }} />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleOpenBalanceEdit(item)}
                              >
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Edit Balance</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval/Rejection Dialog */}
      <Dialog open={!!selectedLeave && !!actionType} onOpenChange={(open) => {
        if (!open) {
          setSelectedLeave(null);
          setActionType(null);
          setReviewNotes('');
        }
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Approve Leave Request
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Leave Request
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Confirm your decision and add reviews. This action updates the employee's leave balance.
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="rounded-lg bg-muted/40 p-4 space-y-3.5 text-sm my-2">
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Employee</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {typeof selectedLeave.userId === 'object' && selectedLeave.userId
                      ? `${selectedLeave.userId.firstName || ''} ${selectedLeave.userId.lastName || ''}`
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Leave Type</p>
                  <p className="font-semibold text-foreground mt-0.5">{resolveLeaveTypeName(selectedLeave)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Duration</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedLeave.totalDays} Days</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dates</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {format(new Date(selectedLeave.startDate), 'MMM dd')} - {format(new Date(selectedLeave.endDate), 'MMM dd')}
                  </p>
                </div>
              </div>
              <div className="border-t border-border/60 pt-2.5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reason for Request</p>
                <p className="italic text-muted-foreground mt-1 font-medium">"{selectedLeave.reason}"</p>
              </div>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === 'reject' ? 'Rejection Reason (Required)' : 'Review Notes (Optional)'}
              </Label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={actionType === 'reject' ? 'Provide feedback on why this request is rejected' : 'Add details or context for the approval'}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedLeave(null);
              setActionType(null);
              setReviewNotes('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAction}
              disabled={isSubmitting}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {isSubmitting ? 'Processing...' : actionType === 'approve' ? 'Confirm Approval' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Balance Adjusting Dialog */}
      <Dialog open={!!selectedBalanceUser} onOpenChange={(open) => {
        if (!open) setSelectedBalanceUser(null);
      }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Adjust Leave Balance
            </DialogTitle>
            <DialogDescription>
              Modify annual allotments for {selectedBalanceUser?.user.firstName} {selectedBalanceUser?.user.lastName}.
            </DialogDescription>
          </DialogHeader>

          {selectedBalanceUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label>Sick Leave (Annual Limit)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={editBalanceForm.sickLeave}
                    onChange={e => setEditBalanceForm(p => ({ ...p, sickLeave: Number(e.target.value) }))}
                  />
                  <span className="text-xs text-muted-foreground shrink-0 w-24">Used: {selectedBalanceUser.sickLeave.used} days</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Casual Leave (Annual Limit)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={editBalanceForm.casualLeave}
                    onChange={e => setEditBalanceForm(p => ({ ...p, casualLeave: Number(e.target.value) }))}
                  />
                  <span className="text-xs text-muted-foreground shrink-0 w-24">Used: {selectedBalanceUser.casualLeave.used} days</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Vacation Leave (Annual Limit)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={editBalanceForm.vacationLeave}
                    onChange={e => setEditBalanceForm(p => ({ ...p, vacationLeave: Number(e.target.value) }))}
                  />
                  <span className="text-xs text-muted-foreground shrink-0 w-24">Used: {selectedBalanceUser.vacationLeave.used} days</span>
                </div>
              </div>

              <div className="flex gap-2 items-start bg-amber-500/10 text-amber-800 rounded-lg p-3 text-xs border border-amber-500/20 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Adjusting these counts alters the total annual allocation. Subtraction below the currently used amount is blocked in production.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBalanceUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBalance}>
              Save Adjustments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

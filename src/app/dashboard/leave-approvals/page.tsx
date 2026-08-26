'use client';

import { useEffect, useState } from 'react';
import { leaveApi } from '@/lib/api';
import { Leave, LeaveStatus } from '@/lib/types';
import {
  resolveLeaveTypeName,
  getLeaveTypeColor,
  isLeaveTypeRecord,
} from '@/lib/leave-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle2, XCircle, Calendar, Clock, ArrowRight, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

type ActionType = 'approve' | 'reject' | null;

export default function LeaveApprovalsPage() {
  const { user } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState<Leave[]>([]);
  const [rejectedLeaves, setRejectedLeaves] = useState<Leave[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingApproved, setIsLoadingApproved] = useState(false);
  const [isLoadingRejected, setIsLoadingRejected] = useState(false);
  
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadPendingLeaves();
  }, []);

  const loadPendingLeaves = async () => {
    try {
      setIsLoadingPending(true);
      const response = await leaveApi.getPendingLeaves();
      setPendingLeaves(response.records);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load pending leaves',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPending(false);
    }
  };

  const loadApprovedLeaves = async () => {
    try {
      setIsLoadingApproved(true);
      const response =
        user?.role === 'supervisor'
          ? await leaveApi.getTeamLeaves({ status: LeaveStatus.APPROVED })
          : await leaveApi.getAllLeaves({ status: LeaveStatus.APPROVED });
      setApprovedLeaves(response.records);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load approved leaves',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingApproved(false);
    }
  };

  const loadRejectedLeaves = async () => {
    try {
      setIsLoadingRejected(true);
      const response =
        user?.role === 'supervisor'
          ? await leaveApi.getTeamLeaves({ status: LeaveStatus.REJECTED })
          : await leaveApi.getAllLeaves({ status: LeaveStatus.REJECTED });
      setRejectedLeaves(response.records);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load rejected leaves',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRejected(false);
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
        const result = await leaveApi.approveLeave(selectedLeave._id, reviewNotes || undefined);
        toast({
          title: 'Success',
          description:
            result.status === LeaveStatus.APPROVED
              ? 'Leave request fully approved'
              : 'Leave advanced to the next approval step',
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
      loadPendingLeaves();
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

  const renderLeaveTable = (leaves: Leave[], showActions: boolean = false) => (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Employee</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Type</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Dates</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Days</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Reason</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Status</TableHead>
            {showActions && <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-3.5">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} className="text-center text-muted-foreground py-12">
                <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm">
                  {showActions
                    ? 'No leave requests awaiting your approval. Requests still with a manager will appear here once they reach your step.'
                    : 'No leave requests found'}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            leaves.map((leave) => {
              const firstName = typeof leave.userId === 'object' && 'firstName' in leave.userId ? leave.userId.firstName : '';
              const lastName = typeof leave.userId === 'object' && 'lastName' in leave.userId ? leave.userId.lastName : '';
              const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Unknown';
              const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'EE';

              const typeColor = isLeaveTypeRecord(leave.leaveTypeId)
                ? getLeaveTypeColor(leave.leaveTypeId.code, leave.status)
                : 'bg-slate-100 text-slate-700 border-slate-200';
              const typeCode = isLeaveTypeRecord(leave.leaveTypeId)
                ? leave.leaveTypeId.code
                : 'LV';

              const isPending = leave.status === 'PENDING';
              const isPartiallyApproved = leave.status === 'PARTIALLY_APPROVED';
              const isApproved = leave.status === 'APPROVED';
              const isRejected = leave.status === 'REJECTED';
              const isCancelled = leave.status === 'CANCELLED';

              return (
                <TableRow key={leave._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-xs font-semibold text-primary shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground leading-tight">{fullName}</p>
                        {typeof leave.userId === 'object' && 'employeeId' in leave.userId && (
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{leave.userId.employeeId}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex size-7 items-center justify-center rounded-lg text-[10px] font-bold border ${typeColor} shrink-0`}>
                        {typeCode}
                      </span>
                      <span className="font-semibold text-sm text-foreground">
                        {resolveLeaveTypeName(leave)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{format(new Date(leave.startDate), 'MMM dd, yyyy')}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mx-0.5" />
                      <span className="font-medium">{format(new Date(leave.endDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 text-xs font-semibold rounded-md text-foreground border border-border/50">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 max-w-xs">
                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="truncate max-w-[180px]" title={leave.reason}>
                        {leave.reason}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {isApproved && (
                      <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit shadow-none">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {isRejected && (
                      <Badge className="bg-rose-500/10 hover:bg-rose-500/15 text-rose-700 border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit shadow-none">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Rejected
                      </Badge>
                    )}
                    {isCancelled && (
                      <Badge className="bg-slate-500/10 hover:bg-slate-500/15 text-slate-700 border-slate-500/20 px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit shadow-none">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Cancelled
                      </Badge>
                    )}
                    {isPending && (
                      <Badge className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit shadow-none">
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        Pending
                      </Badge>
                    )}
                    {isPartiallyApproved && (
                      <Badge className="bg-blue-500/10 hover:bg-blue-500/15 text-blue-700 border-blue-500/20 px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit shadow-none">
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        In Review
                      </Badge>
                    )}
                  </TableCell>
                  {showActions && (
                    <TableCell className="py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(leave)}
                          className="text-emerald-600 border-emerald-100 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all font-medium rounded-lg"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(leave)}
                          className="text-rose-600 border-rose-100 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition-all font-medium rounded-lg"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Approvals</h1>
        <p className="text-muted-foreground">
          Review pending requests and browse approved or rejected history
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingLeaves.length})
          </TabsTrigger>
          <TabsTrigger value="approved" onClick={() => !approvedLeaves.length && loadApprovedLeaves()}>
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" onClick={() => !rejectedLeaves.length && loadRejectedLeaves()}>
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
              <CardDescription>Leave requests awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPending ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : (
                renderLeaveTable(pendingLeaves, true)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Leaves</CardTitle>
              <CardDescription>Previously approved leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingApproved ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : (
                renderLeaveTable(approvedLeaves)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Leaves</CardTitle>
              <CardDescription>Previously rejected leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRejected ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : (
                renderLeaveTable(rejectedLeaves)
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </DialogTitle>
            <DialogDescription>
              {selectedLeave && (
                <div className="space-y-2 mt-4">
                  <p><strong>Employee:</strong> {typeof selectedLeave.userId === 'object' && 'firstName' in selectedLeave.userId
                    ? `${selectedLeave.userId.firstName} ${selectedLeave.userId.lastName}`
                    : 'Unknown'}</p>
                  <p><strong>Type:</strong> {resolveLeaveTypeName(selectedLeave)}</p>
                  <p><strong>Duration:</strong> {format(new Date(selectedLeave.startDate), 'MMM dd, yyyy')} - {format(new Date(selectedLeave.endDate), 'MMM dd, yyyy')} ({selectedLeave.totalDays} days)</p>
                  <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === 'reject' ? 'Rejection Reason (Required)' : 'Notes (Optional)'}
              </Label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={actionType === 'reject' ? 'Please provide a reason for rejection' : 'Add any notes for this decision'}
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
              {isSubmitting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

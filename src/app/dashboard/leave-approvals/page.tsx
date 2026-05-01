'use client';

import { useEffect, useState } from 'react';
import { leaveApi } from '@/lib/api';
import { Leave, LeaveStatus, LeaveType } from '@/lib/types';
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
import { CheckCircle2, XCircle, Calendar, User, Clock } from 'lucide-react';
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
      loadPendingLeaves();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to process leave request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLeaveTypeLabel = (type: LeaveType) => {
    const labels: Record<LeaveType, string> = {
      [LeaveType.SICK]: 'Sick Leave',
      [LeaveType.CASUAL]: 'Casual Leave',
      [LeaveType.VACATION]: 'Vacation Leave',
      [LeaveType.UNPAID]: 'Unpaid Leave',
    };
    return labels[type];
  };

  const getStatusBadge = (status: LeaveStatus) => {
    const variants: Record<LeaveStatus, { variant: any; label: string }> = {
      [LeaveStatus.PENDING]: { variant: 'secondary', label: 'Pending' },
      [LeaveStatus.APPROVED]: { variant: 'default', label: 'Approved' },
      [LeaveStatus.REJECTED]: { variant: 'destructive', label: 'Rejected' },
      [LeaveStatus.CANCELLED]: { variant: 'outline', label: 'Cancelled' },
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderLeaveTable = (leaves: Leave[], showActions: boolean = false) => (
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
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} className="text-center text-muted-foreground py-8">
                No leave requests found
              </TableCell>
            </TableRow>
          ) : (
            leaves.map((leave) => (
              <TableRow key={leave._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {typeof leave.userId === 'object' && 'firstName' in leave.userId
                          ? `${leave.userId.firstName} ${leave.userId.lastName}`
                          : 'Unknown'}
                      </p>
                      {typeof leave.userId === 'object' && 'employeeId' in leave.userId && (
                        <p className="text-xs text-muted-foreground">{leave.userId.employeeId}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getLeaveTypeLabel(leave.leaveType)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {leave.totalDays}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                <TableCell>{getStatusBadge(leave.status)}</TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(leave)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(leave)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Approvals</h1>
        <p className="text-muted-foreground">Review and manage leave requests</p>
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
                  <p><strong>Type:</strong> {getLeaveTypeLabel(selectedLeave.leaveType)}</p>
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

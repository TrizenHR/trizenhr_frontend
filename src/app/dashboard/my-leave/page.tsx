'use client';

import { useEffect, useState } from 'react';
import { leaveApi } from '@/lib/api';
import { Leave, LeaveBalance, LeaveType, LeaveStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function MyLeavePage() {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  
  // Form state
  const [formData, setFormData] = useState({
    leaveType: '' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadBalance();
    loadLeaves();
  }, []);

  const loadBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const data = await leaveApi.getMyBalance();
      setBalance(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load leave balance',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const loadLeaves = async () => {
    try {
      setIsLoadingLeaves(true);
      const response = await leaveApi.getMyLeaves({ page: pagination.page, limit: pagination.limit });
      setLeaves(response.records);
      setPagination(response.pagination);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load leave history',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await leaveApi.requestLeave(formData);
      
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });

      setIsDialogOpen(false);
      setFormData({ leaveType: '' as LeaveType, startDate: '', endDate: '', reason: '' });
      loadBalance();
      loadLeaves();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to request leave',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (leaveId: string) => {
    try {
      await leaveApi.cancelLeave(leaveId);
      toast({
        title: 'Success',
        description: 'Leave request cancelled',
      });
      loadBalance();
      loadLeaves();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to cancel leave',
        variant: 'destructive',
      });
    }
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

  const getLeaveTypeLabel = (type: LeaveType) => {
    const labels: Record<LeaveType, string> = {
      [LeaveType.SICK]: 'Sick Leave',
      [LeaveType.CASUAL]: 'Casual Leave',
      [LeaveType.VACATION]: 'Vacation Leave',
      [LeaveType.UNPAID]: 'Unpaid Leave',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Leave</h1>
          <p className="text-muted-foreground">Manage your leave requests and balance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>Fill in the details to submit your leave request</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(value) => setFormData({ ...formData, leaveType: value as LeaveType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LeaveType.SICK}>Sick Leave</SelectItem>
                    <SelectItem value={LeaveType.CASUAL}>Casual Leave</SelectItem>
                    <SelectItem value={LeaveType.VACATION}>Vacation Leave</SelectItem>
                    <SelectItem value={LeaveType.UNPAID}>Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance ({balance?.year || new Date().getFullYear()})</CardTitle>
          <CardDescription>Your available leave days for this year</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBalance ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : balance ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sick Leave */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Sick Leave</span>
                  <span className="text-muted-foreground">
                    {balance.sickLeave.remaining} / {balance.sickLeave.total}
                  </span>
                </div>
                <Progress value={(balance.sickLeave.remaining / balance.sickLeave.total) * 100} />
                <p className="text-xs text-muted-foreground">
                  {balance.sickLeave.used} days used
                </p>
              </div>

              {/* Casual Leave */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Casual Leave</span>
                  <span className="text-muted-foreground">
                    {balance.casualLeave.remaining} / {balance.casualLeave.total}
                  </span>
                </div>
                <Progress value={(balance.casualLeave.remaining / balance.casualLeave.total) * 100} />
                <p className="text-xs text-muted-foreground">
                  {balance.casualLeave.used} days used
                </p>
              </div>

              {/* Vacation Leave */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Vacation Leave</span>
                  <span className="text-muted-foreground">
                    {balance.vacationLeave.remaining} / {balance.vacationLeave.total}
                  </span>
                </div>
                <Progress value={(balance.vacationLeave.remaining / balance.vacationLeave.total) * 100} />
                <p className="text-xs text-muted-foreground">
                  {balance.vacationLeave.used} days used
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No balance data available</p>
          )}
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>Your past and pending leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLeaves ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : leaves.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>{getLeaveTypeLabel(leave.leaveType)}</TableCell>
                      <TableCell>
                        {format(new Date(leave.startDate), 'MMM dd, yyyy')} -{' '}
                        {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{leave.totalDays}</TableCell>
                      <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>
                        {leave.status === LeaveStatus.PENDING && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(leave._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No leave requests yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

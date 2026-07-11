'use client';

import { useEffect, useState } from 'react';
import { leaveApi, leaveTypeApi } from '@/lib/api';
import { Leave, LeaveBalance, LeaveTypeRecord } from '@/lib/types';
import {
  getLeaveStatusLabel,
  getLeaveStatusVariant,
  isLeaveAwaitingApproval,
  isLeaveTypeRecord,
  resolveLeaveTypeName,
} from '@/lib/leave-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function MyLeavePage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRecord[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    otherLeaveTypeName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const allowedLeaveTypes = leaveTypes.filter((type) =>
    balance?.balances?.some((entry) => {
      const entryTypeId = isLeaveTypeRecord(entry.leaveTypeId)
        ? entry.leaveTypeId._id
        : entry.leaveTypeId;
      return entryTypeId === type._id;
    })
  );

  const selectedType = allowedLeaveTypes.find((t) => t._id === formData.leaveTypeId);

  useEffect(() => {
    void loadBalance();
    void loadLeaves();
    void loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const data = await leaveTypeApi.getAll(true);
      setLeaveTypes(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load leave types', variant: 'destructive' });
    }
  };

  const loadBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const data = await leaveApi.getMyBalance();
      setBalance(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load leave balance', variant: 'destructive' });
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
    } catch {
      toast({ title: 'Error', description: 'Failed to load leave history', variant: 'destructive' });
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({ title: 'Validation Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }

    if (selectedType?.isOther && !formData.otherLeaveTypeName.trim()) {
      toast({ title: 'Validation Error', description: 'Please specify the leave type', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      await leaveApi.requestLeave({
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        isHalfDay: formData.isHalfDay,
        otherLeaveTypeName: selectedType?.isOther ? formData.otherLeaveTypeName : undefined,
      });

      toast({ title: 'Success', description: 'Leave request submitted successfully' });
      setIsDialogOpen(false);
      setFormData({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        isHalfDay: false,
        otherLeaveTypeName: '',
      });
      await loadBalance();
      await loadLeaves();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to request leave',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (leaveId: string) => {
    try {
      await leaveApi.cancelLeave(leaveId);
      toast({ title: 'Success', description: 'Leave request cancelled' });
      await loadBalance();
      await loadLeaves();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to cancel leave',
        variant: 'destructive',
      });
    }
  };

  const renderApproverInfo = (leave: Leave) => {
    const workflow = leave.workflowId;
    if (!workflow || typeof workflow === 'string') {
      return <span className="text-muted-foreground text-xs">—</span>;
    }

    const steps = [...workflow.steps].sort((a, b) => a.order - b.order);
    const pathText = steps
      .map((s) => {
        if (s.approverType === 'SUPERVISOR') return 'Manager';
        if (s.approverType === 'HR') return 'HR';
        if (s.approverType === 'ADMIN') return 'Admin';
        return s.approverType;
      })
      .join(' ➜ ');

    if (leave.status === 'APPROVED') {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-green-600">Fully Approved</span>
          <p className="text-[10px] text-muted-foreground tracking-tight">{pathText}</p>
        </div>
      );
    }

    if (leave.status === 'REJECTED') {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-red-600">Rejected</span>
          <p className="text-[10px] text-muted-foreground tracking-tight">{pathText}</p>
        </div>
      );
    }

    if (leave.status === 'CANCELLED') {
      return (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Cancelled</span>
          <p className="text-[10px] text-muted-foreground tracking-tight">{pathText}</p>
        </div>
      );
    }

    // Awaiting approval (PENDING or PARTIALLY_APPROVED)
    const currentStep = steps.find((s) => s.order === leave.currentApprovalStep);
    let currentApproverLabel = 'Reviewer';
    if (currentStep) {
      if (currentStep.approverType === 'SUPERVISOR') {
        currentApproverLabel = user?.supervisor?.fullName
          ? `Manager (${user.supervisor.fullName})`
          : 'Manager';
      } else if (currentStep.approverType === 'HR') {
        currentApproverLabel = 'HR Admins';
      } else if (currentStep.approverType === 'ADMIN') {
        currentApproverLabel = 'System Admins';
      } else {
        currentApproverLabel = currentStep.approverType;
      }
    }

    if (user?.role === 'hr' && currentStep?.approverType !== 'ADMIN') {
      currentApproverLabel = `${currentApproverLabel} / System Admin`;
    }

    return (
      <div className="space-y-1">
        <div className="text-xs font-medium text-amber-600 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Pending: {currentApproverLabel}
        </div>
        <p className="text-[10px] text-muted-foreground tracking-tight">Path: {pathText}</p>
      </div>
    );
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
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select
                  value={formData.leaveTypeId}
                  onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedLeaveTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name} ({type.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedType?.isOther && (
                <div className="space-y-2">
                  <Label>Specify leave type</Label>
                  <Input
                    value={formData.otherLeaveTypeName}
                    onChange={(e) =>
                      setFormData({ ...formData, otherLeaveTypeName: e.target.value })
                    }
                    placeholder="e.g. Study leave"
                  />
                </div>
              )}

              {selectedType?.allowHalfDay && (
                <div className="flex items-center justify-between">
                  <Label>Half day</Label>
                  <Switch
                    checked={formData.isHalfDay}
                    onCheckedChange={(v) => setFormData({ ...formData, isHalfDay: v })}
                  />
                </div>
              )}

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
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Leave Balance ({balance?.year || new Date().getFullYear()})</CardTitle>
              <CardDescription>Your available leave days for this year</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : balance?.balances?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {balance.balances.map((entry) => {
                    const typeName = isLeaveTypeRecord(entry.leaveTypeId)
                      ? entry.leaveTypeId.name
                      : 'Leave';
                    const pct =
                      entry.allocated > 0 ? (entry.remaining / entry.allocated) * 100 : 0;
                    const isExhausted = entry.remaining === 0 && entry.allocated > 0;
                    const isUrgent = !isExhausted && pct < 20;
                    const isWarning = !isExhausted && !isUrgent && pct < 50;
                    const numberColor = isExhausted
                      ? 'text-gray-400'
                      : isUrgent
                        ? 'text-red-500'
                        : isWarning
                          ? 'text-amber-500'
                          : 'text-primary';
                    const barColor = isExhausted
                      ? 'bg-gray-300'
                      : isUrgent
                        ? 'bg-red-500'
                        : isWarning
                          ? 'bg-amber-500'
                          : 'bg-primary';

                    return (
                      <div key={typeName} className="space-y-2">
                        <p className="text-sm font-semibold">{typeName}</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-2xl font-bold ${numberColor}`}>{entry.remaining}</span>
                          <span className="text-xs text-muted-foreground">
                            / {entry.allocated} days left
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted/50">
                          <div
                            className={`h-1.5 rounded-full ${barColor}`}
                            style={{ width: `${Math.max(pct, 0)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{entry.used} used</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No balance data available</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full border-primary/20 shadow-sm bg-gradient-to-br from-background via-background to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="size-4" />
                </span>
                Approval Authority
              </CardTitle>
              <CardDescription>Leave policy & review workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active Policy</span>
                <p className="text-sm font-bold text-foreground">{balance?.policy?.policyName || 'General Staff Leave Policy'}</p>
              </div>
              
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Approval Sequence</span>
                {balance?.policy?.workflow?.steps?.length ? (
                  <div className="relative pl-6 border-l border-primary/20 space-y-4 py-1">
                    {[...balance.policy.workflow.steps]
                      .sort((a, b) => a.order - b.order)
                      .map((step) => {
                        const isSupervisor = step.approverType === 'SUPERVISOR';
                        const isHr = step.approverType === 'HR';
                        const isAdmin = step.approverType === 'ADMIN';
                        
                        let title: string = step.approverType;
                        let desc = 'Authorized reviewer';
                        
                        if (isSupervisor) {
                          title = 'Manager / Supervisor';
                          desc = user?.supervisor?.fullName 
                            ? `${user.supervisor.fullName} (${user.supervisor.email})`
                            : 'Your assigned supervisor';
                        } else if (isHr) {
                          title = 'HR Administrator';
                          desc = 'Any HR Operations member';
                        } else if (isAdmin) {
                          title = 'System Admin';
                          desc = 'Primary system administrators';
                        }
                        
                        return (
                          <div key={step.order} className="relative group">
                            {/* Dot */}
                            <div className="absolute -left-[30px] top-1 flex size-4 items-center justify-center rounded-full border border-primary bg-background text-[9px] font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              {step.order}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-foreground">{title}</p>
                              <p className="text-[10px] text-muted-foreground leading-normal">{desc}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-muted-foreground/20 p-4 text-center">
                    <p className="text-xs text-muted-foreground">No workflow steps configured.</p>
                  </div>
                )}
              </div>
              {user?.role === 'hr' && (
                <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 p-3 text-[11px] text-primary/80 flex items-start gap-2">
                  <Shield className="size-4 shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    <strong>HR Special Rules</strong>: Irrespective of your leave policy workflow, any System Administrator can view and approve your requests at any step.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>Your past and pending leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLeaves ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : leaves.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Approver Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>{resolveLeaveTypeName(leave)}</TableCell>
                      <TableCell>
                        {format(new Date(leave.startDate), 'MMM dd, yyyy')} –{' '}
                        {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{leave.totalDays}</TableCell>
                      <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                      <TableCell>{renderApproverInfo(leave)}</TableCell>
                      <TableCell>
                        <Badge variant={getLeaveStatusVariant(leave.status)}>
                          {getLeaveStatusLabel(leave.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isLeaveAwaitingApproval(leave.status) && (
                          <Button variant="ghost" size="sm" onClick={() => void handleCancel(leave._id)}>
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
            <p className="text-center text-muted-foreground py-8">No leave requests yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

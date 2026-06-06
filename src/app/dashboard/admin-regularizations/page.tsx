'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { attendanceApi } from '@/lib/api';
import { AttendanceRegularization, RegularizationStatus, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ClipboardList,
  Clock,
  AlertCircle,
  Shield,
} from 'lucide-react';

type ActionType = 'approve' | 'reject' | null;
type TabType = 'pending' | 'approved' | 'rejected';

function resolveUser(userId: string | User): { name: string; role: string | null; dept: string | null } {
  if (typeof userId === 'object' && userId) {
    return {
      name: `${userId.firstName} ${userId.lastName}`,
      role: (userId as any).role ?? null,
      dept: (userId as any).department ?? null,
    };
  }
  return { name: 'Employee', role: null, dept: null };
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null;
  const colors: Record<string, string> = {
    hr: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300',
    admin: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
    employee: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    supervisor: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${colors[role] ?? colors.employee}`}
    >
      {role === 'hr' ? 'HR' : role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: RegularizationStatus }) {
  const cfg: Record<RegularizationStatus, { label: string; cls: string; icon: React.ReactNode }> =
    {
      [RegularizationStatus.PENDING]: {
        label: 'Pending',
        cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
        icon: <AlertCircle className="h-3 w-3" />,
      },
      [RegularizationStatus.APPROVED]: {
        label: 'Approved',
        cls: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300',
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      [RegularizationStatus.REJECTED]: {
        label: 'Rejected',
        cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
        icon: <XCircle className="h-3 w-3" />,
      },
    };
  const { label, cls, icon } = cfg[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {icon}
      {label}
    </span>
  );
}

export default function AdminRegularizationsPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<AttendanceRegularization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selected, setSelected] = useState<AttendanceRegularization | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      // Admin gets all requests (including HR's own) from the backend
      const res = await attendanceApi.getPendingRegularizations({ limit: 200 });
      setAllRecords(res.records);
    } catch {
      toast({ title: 'Error', description: 'Failed to load regularization requests', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  // Frontend tab filtering: the API returns only pending for admin too (pending endpoint).
  // We treat them all as pending since that's what the endpoint returns.
  const counts = {
    pending: allRecords.filter((r) => r.status === RegularizationStatus.PENDING).length,
    approved: allRecords.filter((r) => r.status === RegularizationStatus.APPROVED).length,
    rejected: allRecords.filter((r) => r.status === RegularizationStatus.REJECTED).length,
  };

  const filtered =
    activeTab === 'pending'
      ? allRecords.filter((r) => r.status === RegularizationStatus.PENDING)
      : activeTab === 'approved'
        ? allRecords.filter((r) => r.status === RegularizationStatus.APPROVED)
        : allRecords.filter((r) => r.status === RegularizationStatus.REJECTED);

  const handleSubmit = async () => {
    if (!selected || !actionType) return;
    if (actionType === 'reject' && !notes.trim()) {
      toast({ title: 'Validation', description: 'Please provide a reason for rejection', variant: 'destructive' });
      return;
    }
    try {
      setIsSubmitting(true);
      if (actionType === 'approve') {
        await attendanceApi.approveRegularization(selected._id, notes || undefined);
        toast({ title: 'Approved', description: 'Attendance record updated successfully.' });
      } else {
        await attendanceApi.rejectRegularization(selected._id, notes);
        toast({ title: 'Rejected', description: 'Request has been declined.' });
      }
      setSelected(null);
      setActionType(null);
      setNotes('');
      await loadAll();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message || 'Action failed',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'approved', label: 'Approved', count: counts.approved },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  const tabColors: Record<TabType, string> = {
    pending:
      'border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-300',
    approved:
      'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/30 dark:text-green-300',
    rejected:
      'border-red-500 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950/30 dark:text-red-300',
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Regularization Approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review attendance correction requests from all employees and HR staff.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-950/30">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Company Admin</span>
        </div>
      </div>

      {/* Stats tabs */}
      <div className="grid grid-cols-3 gap-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              activeTab === t.key
                ? tabColors[t.key]
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <p className="text-xs font-medium text-muted-foreground">{t.label}</p>
            <p className="mt-1 text-3xl font-bold">{t.count}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests
          </CardTitle>
          <CardDescription>
            {filtered.length} request{filtered.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">No {activeTab} requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Requested Timing</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((req) => {
                  const { name, role, dept } = resolveUser(req.userId);
                  const isPending = req.status === RegularizationStatus.PENDING;
                  return (
                    <TableRow key={req._id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-sm">{name}</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <RoleBadge role={role} />
                            {dept && (
                              <span className="text-[11px] text-muted-foreground">{dept}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(req.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="capitalize">
                        <span className="text-sm">
                          {req.requestedStatus.replace('_', ' ')}
                        </span>
                        {(req.requestedCheckIn || req.requestedCheckOut) && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {req.requestedCheckIn &&
                              `In: ${format(new Date(req.requestedCheckIn), 'HH:mm')}`}
                            {req.requestedCheckIn && req.requestedCheckOut && ' · '}
                            {req.requestedCheckOut &&
                              `Out: ${format(new Date(req.requestedCheckOut), 'HH:mm')}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <p className="truncate text-sm" title={req.reason}>
                          {req.reason}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                        {req.reviewNotes && (
                          <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1" title={req.reviewNotes}>
                            Note: {req.reviewNotes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPending ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                setSelected(req);
                                setActionType('approve');
                                setNotes('');
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-400"
                              onClick={() => {
                                setSelected(req);
                                setActionType('reject');
                                setNotes('');
                              }}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Decided
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={Boolean(selected && actionType)}
        onOpenChange={() => {
          setSelected(null);
          setActionType(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {selected && (() => {
                const { name, role } = resolveUser(selected.userId);
                return `${name}${role ? ` (${role.toUpperCase()})` : ''} — ${format(new Date(selected.date), 'dd MMM yyyy')}`;
              })()}
            </DialogDescription>
          </DialogHeader>

          {/* Lock notice */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              ⚠️ Once you {actionType === 'approve' ? 'approve' : 'reject'} this request, the
              decision is final and locked — HR cannot override it.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-review-notes">
              {actionType === 'reject' ? 'Rejection reason *' : 'Notes (optional)'}
            </Label>
            <Textarea
              id="admin-review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                actionType === 'reject'
                  ? 'Provide a reason for rejection...'
                  : 'Optional notes for the employee...'
              }
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelected(null);
                setActionType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : actionType === 'approve' ? (
                'Approve'
              ) : (
                'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

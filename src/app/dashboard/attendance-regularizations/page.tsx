'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { attendanceApi } from '@/lib/api';
import { AttendanceRegularization, User } from '@/lib/types';
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
  FileEdit,
  Loader2,
  XCircle,
  Lock,
} from 'lucide-react';

type ActionType = 'approve' | 'reject' | null;

function employeeName(userId: string | User): string {
  if (typeof userId === 'object' && userId) {
    return `${userId.firstName} ${userId.lastName}`;
  }
  return 'Employee';
}

function employeeRole(userId: string | User): string | null {
  if (typeof userId === 'object' && userId && 'role' in userId) {
    return (userId as any).role as string;
  }
  return null;
}

function employeeDept(userId: string | User): string | null {
  if (typeof userId === 'object' && userId && 'department' in userId) {
    return (userId as any).department as string | null;
  }
  return null;
}

export default function AttendanceRegularizationsPage() {
  const { toast } = useToast();
  const [pending, setPending] = useState<AttendanceRegularization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<AttendanceRegularization | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPending = async () => {
    try {
      setIsLoading(true);
      const res = await attendanceApi.getPendingRegularizations();
      setPending(res.records);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load pending requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPending();
  }, []);

  const handleSubmit = async () => {
    if (!selected || !actionType) return;
    if (actionType === 'reject' && !notes.trim()) {
      toast({
        title: 'Validation',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (actionType === 'approve') {
        await attendanceApi.approveRegularization(selected._id, notes || undefined);
        toast({ title: 'Approved', description: 'Attendance updated successfully.' });
      } else {
        await attendanceApi.rejectRegularization(selected._id, notes);
        toast({ title: 'Rejected', description: 'Request declined.' });
      }
      setSelected(null);
      setActionType(null);
      setNotes('');
      await loadPending();
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance Regularizations</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve attendance correction requests from your team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Pending Requests
          </CardTitle>
          <CardDescription>{pending.length} awaiting your review</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((req) => {
                  const role = employeeRole(req.userId);
                  const dept = employeeDept(req.userId);
                  return (
                    <TableRow key={req._id}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{employeeName(req.userId)}</span>
                          <div className="flex flex-wrap gap-1">
                            {role && (
                              <Badge
                                variant="secondary"
                                className="h-4 px-1.5 text-[10px] capitalize"
                              >
                                {role}
                              </Badge>
                            )}
                            {dept && (
                              <span className="text-[11px] text-muted-foreground">{dept}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(req.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="capitalize">
                        {req.requestedStatus.replace('_', ' ')}
                        {req.requestedCheckIn &&
                          ` (${format(new Date(req.requestedCheckIn), 'HH:mm')}`}
                        {req.requestedCheckOut &&
                          ` – ${format(new Date(req.requestedCheckOut), 'HH:mm')})`}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{req.reason}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:text-green-400"
                            onClick={() => {
                              setSelected(req);
                              setActionType('approve');
                              setNotes('');
                            }}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
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
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
              {selected &&
                `${employeeName(selected.userId)} — ${format(new Date(selected.date), 'dd MMM yyyy')}`}
            </DialogDescription>
          </DialogHeader>

          {/* Lock notice */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Once you {actionType === 'approve' ? 'approve' : 'reject'} this request, the decision
              will be locked and cannot be changed by Admin.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-notes">
              {actionType === 'reject' ? 'Rejection reason *' : 'Notes (optional)'}
            </Label>
            <Textarea
              id="review-notes"
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

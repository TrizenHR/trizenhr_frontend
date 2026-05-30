'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { attendanceApi } from '@/lib/api';
import { AttendanceRegularization, User } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, FileEdit, Loader2, XCircle } from 'lucide-react';
type ActionType = 'approve' | 'reject' | null;

function employeeName(userId: string | User): string {
  if (typeof userId === 'object' && userId) {
    return `${userId.firstName} ${userId.lastName}`;
  }
  return 'Employee';
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
        toast({ title: 'Approved', description: 'Attendance updated' });
      } else {
        await attendanceApi.rejectRegularization(selected._id, notes);
        toast({ title: 'Rejected', description: 'Request declined' });
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
        <h1 className="text-2xl font-bold tracking-tight">Attendance regularizations</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve attendance correction requests from your team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Pending requests
          </CardTitle>
          <CardDescription>{pending.length} awaiting review</CardDescription>
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
                {pending.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-medium">{employeeName(req.userId)}</TableCell>
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
                ))}
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
            <DialogTitle>
              {actionType === 'approve' ? 'Approve request' : 'Reject request'}
            </DialogTitle>
            <DialogDescription>
              {selected &&
                `${employeeName(selected.userId)} — ${format(new Date(selected.date), 'dd MMM yyyy')}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="review-notes">
              {actionType === 'reject' ? 'Rejection reason' : 'Notes (optional)'}
            </Label>
            <Textarea
              id="review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

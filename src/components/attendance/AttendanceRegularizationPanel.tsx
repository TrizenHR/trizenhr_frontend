'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { attendanceApi } from '@/lib/api';
import {
  AttendanceRegularization,
  AttendanceStatus,
  RegularizationStatus,
} from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileEdit, Loader2 } from 'lucide-react';

export function AttendanceRegularizationPanel() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<AttendanceRegularization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [date, setDate] = useState('');
  const [requestType, setRequestType] = useState('attendance_correction');
  const [requestedCheckIn, setRequestedCheckIn] = useState('09:00');
  const [requestedCheckOut, setRequestedCheckOut] = useState('18:00');
  const [requestedStatus, setRequestedStatus] = useState<AttendanceStatus>(
    AttendanceStatus.PRESENT
  );
  const [reason, setReason] = useState('');

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const res = await attendanceApi.getMyRegularizations({ page: 1, limit: 10 });
      setRequests(res.records);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load regularization requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleSubmit = async () => {
    if (!date || !reason.trim()) {
      toast({
        title: 'Validation',
        description: 'Date and reason are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await attendanceApi.createRegularization({
        date,
        requestType,
        requestedCheckIn,
        requestedCheckOut,
        requestedStatus,
        reason: reason.trim(),
      });
      toast({ title: 'Submitted', description: 'Regularization request sent for approval' });
      setOpen(false);
      setReason('');
      setDate('');
      setRequestType('attendance_correction');
      await loadRequests();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message || 'Failed to submit request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadge = (status: RegularizationStatus) => {
    if (status === RegularizationStatus.APPROVED) {
      return <Badge className="bg-green-600">Approved</Badge>;
    }
    if (status === RegularizationStatus.REJECTED) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Attendance regularization
          </CardTitle>
          <CardDescription>
            Request a correction if you forgot to check in or need your attendance updated.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">New request</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request regularization</DialogTitle>
              <DialogDescription>
                Your manager or HR will review and approve the correction.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Request Type</Label>
                <Select
                  value={requestType}
                  onValueChange={setRequestType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance_correction">Attendance Correction</SelectItem>
                    <SelectItem value="missed_check_in">Missed Check-In</SelectItem>
                    <SelectItem value="missed_check_out">Missed Check-Out</SelectItem>
                    <SelectItem value="incorrect_timing">Incorrect Timing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-date">Date</Label>
                <Input
                  id="reg-date"
                  type="date"
                  value={date}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-in">Check-in</Label>
                  <Input
                    id="reg-in"
                    type="time"
                    value={requestedCheckIn}
                    onChange={(e) => setRequestedCheckIn(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-out">Check-out</Label>
                  <Input
                    id="reg-out"
                    type="time"
                    value={requestedCheckOut}
                    onChange={(e) => setRequestedCheckOut(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Requested status</Label>
                <Select
                  value={requestedStatus}
                  onValueChange={(v) => setRequestedStatus(v as AttendanceStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AttendanceStatus.PRESENT}>Present</SelectItem>
                    <SelectItem value={AttendanceStatus.LATE}>Late</SelectItem>
                    <SelectItem value={AttendanceStatus.HALF_DAY}>Half day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-reason">Reason</Label>
                <Textarea
                  id="reg-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Forgot to check in after client visit"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit request'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No regularization requests yet.</p>
        ) : (
          <ul className="space-y-2">
            {requests.map((req) => (
              <li
                key={req._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div>
                  <span className="font-medium">{format(new Date(req.date), 'dd MMM yyyy')}</span>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span className="capitalize">{req.requestedStatus.replace('_', ' ')}</span>
                </div>
                {statusBadge(req.status)}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

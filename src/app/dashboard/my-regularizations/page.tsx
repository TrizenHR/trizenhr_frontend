'use client';

import { useEffect, useState } from 'react';
import { attendanceApi } from '@/lib/api';
import { AttendanceRegularization, AttendanceStatus, RegularizationStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Plus, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const REQUEST_TYPES = [
  { value: 'missed_check_in', label: 'Missed Check-In' },
  { value: 'missed_check_out', label: 'Missed Check-Out' },
  { value: 'incorrect_timing', label: 'Incorrect Timing' },
  { value: 'attendance_correction', label: 'Attendance Correction' },
];

export default function MyRegularizationsPage() {
  const [records, setRecords] = useState<AttendanceRegularization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | RegularizationStatus>('all');
  const { toast } = useToast();

  const [form, setForm] = useState({
    type: '',
    date: '',
    requestedCheckIn: '',
    requestedCheckOut: '',
    reason: '',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const res = await attendanceApi.getMyRegularizations({ page: 1, limit: 50 });
      setRecords(res.records || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load regularization requests', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.date || !form.reason) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    try {
      setIsSubmitting(true);
      await attendanceApi.createRegularization({
        date: form.date,
        requestType: form.type,
        requestedCheckIn: form.requestedCheckIn || undefined,
        requestedCheckOut: form.requestedCheckOut || undefined,
        requestedStatus: AttendanceStatus.PRESENT,
        reason: `[${REQUEST_TYPES.find(t => t.value === form.type)?.label}] ${form.reason}`,
      });
      toast({ title: 'Request Submitted', description: 'Your regularization request has been submitted.' });
      setIsDialogOpen(false);
      setForm({ type: '', date: '', requestedCheckIn: '', requestedCheckOut: '', reason: '' });
      loadRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to submit request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig: Record<RegularizationStatus, { label: string; icon: React.ReactNode; badge: string }> = {
    [RegularizationStatus.PENDING]: { label: 'Pending', icon: <AlertCircle className="h-4 w-4 text-amber-500" />, badge: 'bg-amber-100 text-amber-700 border-amber-200' },
    [RegularizationStatus.APPROVED]: { label: 'Approved', icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, badge: 'bg-green-100 text-green-700 border-green-200' },
    [RegularizationStatus.REJECTED]: { label: 'Rejected', icon: <XCircle className="h-4 w-4 text-red-500" />, badge: 'bg-red-100 text-red-700 border-red-200' },
  };

  const counts = {
    all: records.length,
    [RegularizationStatus.PENDING]: records.filter(r => r.status === RegularizationStatus.PENDING).length,
    [RegularizationStatus.APPROVED]: records.filter(r => r.status === RegularizationStatus.APPROVED).length,
    [RegularizationStatus.REJECTED]: records.filter(r => r.status === RegularizationStatus.REJECTED).length,
  };

  const filtered = activeTab === 'all' ? records : records.filter(r => r.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Regularization Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Request corrections for missed or incorrect attendance records
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>New Regularization Request</DialogTitle>
              <DialogDescription>Submit a request to correct your attendance record.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Request Type <span className="text-destructive">*</span></Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.date} max={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Requested Check-In</Label>
                  <Input type="time" value={form.requestedCheckIn}
                    onChange={e => setForm(p => ({ ...p, requestedCheckIn: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Requested Check-Out</Label>
                  <Input type="time" value={form.requestedCheckOut}
                    onChange={e => setForm(p => ({ ...p, requestedCheckOut: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason <span className="text-destructive">*</span></Label>
                <Textarea placeholder="Explain why this correction is needed..." rows={3}
                  value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { key: 'all', label: 'Total', color: 'text-foreground' },
          { key: RegularizationStatus.PENDING, label: 'Pending', color: 'text-amber-600' },
          { key: RegularizationStatus.APPROVED, label: 'Approved', color: 'text-green-600' },
          { key: RegularizationStatus.REJECTED, label: 'Rejected', color: 'text-red-600' },
        ].map(s => (
          <button key={s.key} onClick={() => setActiveTab(s.key as any)}
            className={`rounded-xl border p-4 text-left transition-all ${activeTab === s.key ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:bg-muted/40'}`}>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{counts[s.key as keyof typeof counts]}</p>
          </button>
        ))}
      </div>

      {/* Records */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'all' ? 'All Requests' : statusConfig[activeTab as RegularizationStatus]?.label + ' Requests'}
          </CardTitle>
          <CardDescription>{filtered.length} request{filtered.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">No requests found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Create a new regularization request to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(record => {
                const cfg = statusConfig[record.status];
                return (
                  <div key={record._id} className="flex items-start gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                    <div className="mt-0.5">{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm">
                          {format(new Date(record.date), 'EEE, MMM dd, yyyy')}
                        </p>
                        <Badge className={`text-xs border ${cfg.badge}`}>{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{record.reason}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {record.requestedCheckIn && (
                          <span>Check-in: <strong className="text-foreground">{record.requestedCheckIn}</strong></span>
                        )}
                        {record.requestedCheckOut && (
                          <span>Check-out: <strong className="text-foreground">{record.requestedCheckOut}</strong></span>
                        )}
                        <span>Submitted: {format(new Date(record.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      {record.reviewNotes && (
                        <p className="mt-2 text-xs italic text-muted-foreground border-l-2 border-border pl-2">
                          Reviewer note: {record.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

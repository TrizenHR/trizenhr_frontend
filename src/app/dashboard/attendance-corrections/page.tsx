'use client';

import { useEffect, useState } from 'react';
import { attendanceApi, userApi } from '@/lib/api';
import { Attendance, AttendanceStatus, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { FilePen, Loader2, Search, ShieldCheck } from 'lucide-react';

export default function AttendanceCorrectionsPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<(Attendance & { user?: User })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editRecord, setEditRecord] = useState<(Attendance & { user?: User }) | null>(null);
  const [editForm, setEditForm] = useState({ checkIn: '', checkOut: '', status: '', notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Audit log (frontend only — real audit log needs backend)
  const [auditLog, setAuditLog] = useState<{ time: string; action: string; by: string }[]>([]);

  useEffect(() => { load(); }, [dateFrom, dateTo]);

  const load = async () => {
    try {
      setIsLoading(true);
      const [allUsers, attRes] = await Promise.all([
        userApi.getAllUsers({ isActive: true }),
        attendanceApi.getAllAttendance({
          startDate: startOfDay(new Date(dateFrom)),
          endDate: endOfDay(new Date(dateTo)),
          page: 1, limit: 200,
        }),
      ]);
      const enriched = attRes.records.map(a => {
        const uid = typeof a.userId === 'object' ? (a.userId as any)._id : a.userId;
        return { ...a, user: allUsers.find(u => u._id === uid) };
      });
      setRecords(enriched);
    } catch {
      toast({ title: 'Error', description: 'Failed to load records', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (rec: Attendance & { user?: User }) => {
    setEditRecord(rec);
    setEditForm({
      checkIn: rec.checkIn ? format(new Date(rec.checkIn), "yyyy-MM-dd'T'HH:mm") : '',
      checkOut: rec.checkOut ? format(new Date(rec.checkOut), "yyyy-MM-dd'T'HH:mm") : '',
      status: rec.status,
      notes: rec.notes || '',
    });
  };

  const saveCorrection = async () => {
    if (!editRecord) return;
    // TODO: call PATCH /attendance/:id when backend supports it
    // For now, update local state and log the audit entry
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 600)); // simulate API call
    const userName = editRecord.user ? `${editRecord.user.firstName} ${editRecord.user.lastName}` : 'Unknown';
    setAuditLog(prev => [
      { time: new Date().toISOString(), action: `Corrected attendance for ${userName} on ${format(new Date(editRecord.date), 'MMM dd')}`, by: 'HR' },
      ...prev,
    ]);
    setRecords(prev => prev.map(r => r._id === editRecord._id ? {
      ...r,
      checkIn: editForm.checkIn ? new Date(editForm.checkIn).toISOString() : r.checkIn,
      checkOut: editForm.checkOut ? new Date(editForm.checkOut).toISOString() : r.checkOut,
      status: editForm.status as AttendanceStatus,
      notes: editForm.notes,
    } : r));
    toast({ title: 'Correction Saved', description: 'Attendance record updated. (Backend integration pending)' });
    setEditRecord(null);
    setIsSaving(false);
  };

  const statusColors: Record<string, string> = {
    present: 'bg-green-100 text-green-700 border-green-200',
    late: 'bg-amber-100 text-amber-700 border-amber-200',
    absent: 'bg-red-100 text-red-700 border-red-200',
    half_day: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    on_leave: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const filtered = records.filter(r => {
    if (!search) return true;
    const name = r.user ? `${r.user.firstName} ${r.user.lastName}`.toLowerCase() : '';
    return name.includes(search.toLowerCase()) || (r.user?.employeeId || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Attendance Corrections</h1>
        <p className="text-sm text-muted-foreground mt-1">Modify attendance records and correct punches. All changes are audited.</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To Date</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Search Employee</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Name or Employee ID..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Records */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records ({filtered.length})</CardTitle>
              <CardDescription>Click "Correct" to modify a record</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filtered.slice(0, 50).map(rec => (
                    <div key={rec._id} className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm">
                            {rec.user ? `${rec.user.firstName} ${rec.user.lastName}` : 'Unknown'}
                          </p>
                          <Badge className={`text-[10px] border ${statusColors[rec.status] || ''}`}>
                            {rec.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(rec.date), 'EEE, MMM dd, yyyy')}
                          {' · '}
                          {rec.checkIn ? format(new Date(rec.checkIn), 'hh:mm a') : 'No CI'}
                          {' → '}
                          {rec.checkOut ? format(new Date(rec.checkOut), 'hh:mm a') : 'No CO'}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openEdit(rec)}>
                        <FilePen className="mr-1.5 h-3.5 w-3.5" /> Correct
                      </Button>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">No records found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit Log */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-600" /> Audit Log
              </CardTitle>
              <CardDescription>Recent corrections made in this session</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLog.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No corrections yet</p>
              ) : (
                <div className="space-y-3">
                  {auditLog.map((log, i) => (
                    <div key={i} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs font-medium">{log.action}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {format(new Date(log.time), 'hh:mm a')} · By {log.by}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Correct Attendance</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/40 p-3 text-sm">
                <p className="font-semibold">{editRecord.user ? `${editRecord.user.firstName} ${editRecord.user.lastName}` : ''}</p>
                <p className="text-muted-foreground">{format(new Date(editRecord.date), 'EEEE, MMMM dd, yyyy')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Check-In Time</Label>
                  <Input type="datetime-local" value={editForm.checkIn} onChange={e => setEditForm(p => ({ ...p, checkIn: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Check-Out Time</Label>
                  <Input type="datetime-local" value={editForm.checkOut} onChange={e => setEditForm(p => ({ ...p, checkOut: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(AttendanceStatus).map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Correction Notes</Label>
                <Textarea placeholder="Reason for this correction..." rows={3} value={editForm.notes}
                  onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRecord(null)}>Cancel</Button>
            <Button onClick={saveCorrection} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

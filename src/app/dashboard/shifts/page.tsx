'use client';

import { useEffect, useMemo, useState } from 'react';
import { shiftApi } from '@/lib/api';
import { Shift, ShiftStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Moon, Plus, Clock, Loader2 } from 'lucide-react';

type FormState = {
  shiftName: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  breakMinutes: number;
  isNightShift: boolean;
};

const emptyForm: FormState = {
  shiftName: '',
  startTime: '09:00',
  endTime: '18:00',
  graceMinutes: 15,
  breakMinutes: 0,
  isNightShift: false,
};

export default function ShiftsPage() {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const stats = useMemo(
    () => ({
      total: shifts.length,
      active: shifts.filter((s) => s.status === ShiftStatus.ACTIVE).length,
    }),
    [shifts]
  );

  useEffect(() => {
    void loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setIsLoading(true);
      const data = await shiftApi.getAll();
      setShifts(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load shifts', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (shift: Shift) => {
    setEditing(shift);
    setForm({
      shiftName: shift.shiftName,
      startTime: shift.startTime,
      endTime: shift.endTime,
      graceMinutes: shift.graceMinutes,
      breakMinutes: shift.breakMinutes ?? 0,
      isNightShift: shift.isNightShift,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.shiftName.trim() || !form.startTime || !form.endTime) {
      toast({ title: 'Validation', description: 'Name and times are required', variant: 'destructive' });
      return;
    }
    try {
      setIsSaving(true);
      if (editing) {
        await shiftApi.update(editing._id, form);
        toast({ title: 'Updated', description: 'Shift updated' });
      } else {
        await shiftApi.create(form);
        toast({ title: 'Created', description: 'Shift created' });
      }
      setDialogOpen(false);
      await loadShifts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to save shift',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (shift: Shift) => {
    const next = shift.status === ShiftStatus.ACTIVE ? ShiftStatus.INACTIVE : ShiftStatus.ACTIVE;
    try {
      await shiftApi.updateStatus(shift._id, next);
      toast({ title: next === ShiftStatus.ACTIVE ? 'Activated' : 'Deactivated' });
      await loadShifts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Policies</p>
        <h1 className="text-2xl font-bold md:text-3xl">Shift Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define base shift timings for attendance policies
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 max-w-xs">
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <Clock className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={openCreate} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Create Shift
      </Button>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shifts.map((shift) => (
            <Card key={shift._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{shift.shiftName}</CardTitle>
                    <CardDescription>
                      {shift.startTime} – {shift.endTime} · {shift.expectedHours}h expected
                    </CardDescription>
                  </div>
                  <Badge variant={shift.status === ShiftStatus.ACTIVE ? 'default' : 'secondary'}>
                    {shift.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Grace {shift.graceMinutes} min
                  {shift.isNightShift ? ' · Night shift' : ''}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(shift)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => void toggleStatus(shift)}
                  >
                    {shift.status === ShiftStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Shift' : 'Create Shift'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Shift name</Label>
              <Input
                value={form.shiftName}
                onChange={(e) => setForm({ ...form, shiftName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grace (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.graceMinutes}
                  onChange={(e) => setForm({ ...form, graceMinutes: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Break (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.breakMinutes}
                  onChange={(e) => setForm({ ...form, breakMinutes: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Night shift</Label>
              <Switch
                checked={form.isNightShift}
                onCheckedChange={(v) => setForm({ ...form, isNightShift: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

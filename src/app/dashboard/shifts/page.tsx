'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Clock, Users, Timer } from 'lucide-react';

type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  graceMinutes: number;
  weeklyOff: string[];
  assignedCount: number;
  color: string;
};

const INITIAL_SHIFTS: Shift[] = [
  { id: '1', name: 'General Shift', startTime: '09:00', endTime: '18:00', workingHours: 8, graceMinutes: 15, weeklyOff: ['Saturday', 'Sunday'], assignedCount: 0, color: 'bg-blue-500' },
  { id: '2', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', workingHours: 8, graceMinutes: 10, weeklyOff: ['Sunday'], assignedCount: 0, color: 'bg-amber-500' },
  { id: '3', name: 'Night Shift', startTime: '22:00', endTime: '06:00', workingHours: 8, graceMinutes: 10, weeklyOff: ['Sunday'], assignedCount: 0, color: 'bg-indigo-500' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SHIFT_COLORS = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-amber-500', label: 'Amber' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-indigo-500', label: 'Indigo' },
  { value: 'bg-red-500', label: 'Red' },
];

export default function ShiftsPage() {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [form, setForm] = useState({ name: '', startTime: '09:00', endTime: '18:00', graceMinutes: '15', weeklyOff: [] as string[], color: 'bg-blue-500' });

  const calcHours = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    return Math.round((mins / 60) * 10) / 10;
  };

  const openCreate = () => {
    setEditShift(null);
    setForm({ name: '', startTime: '09:00', endTime: '18:00', graceMinutes: '15', weeklyOff: [], color: 'bg-blue-500' });
    setIsDialogOpen(true);
  };

  const openEdit = (s: Shift) => {
    setEditShift(s);
    setForm({ name: s.name, startTime: s.startTime, endTime: s.endTime, graceMinutes: String(s.graceMinutes), weeklyOff: s.weeklyOff, color: s.color });
    setIsDialogOpen(true);
  };

  const toggleDay = (day: string) => {
    setForm(p => ({ ...p, weeklyOff: p.weeklyOff.includes(day) ? p.weeklyOff.filter(d => d !== day) : [...p.weeklyOff, day] }));
  };

  const save = () => {
    if (!form.name || !form.startTime || !form.endTime) {
      toast({ title: 'Validation Error', description: 'Name, start and end times are required', variant: 'destructive' });
      return;
    }
    const shift: Shift = {
      id: editShift?.id || Date.now().toString(),
      name: form.name,
      startTime: form.startTime,
      endTime: form.endTime,
      workingHours: calcHours(form.startTime, form.endTime),
      graceMinutes: parseInt(form.graceMinutes) || 15,
      weeklyOff: form.weeklyOff,
      assignedCount: editShift?.assignedCount || 0,
      color: form.color,
    };
    if (editShift) {
      setShifts(p => p.map(s => s.id === editShift.id ? shift : s));
      toast({ title: 'Shift Updated', description: `${shift.name} has been updated.` });
    } else {
      setShifts(p => [...p, shift]);
      toast({ title: 'Shift Created', description: `${shift.name} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const deleteShift = (id: string) => {
    setShifts(p => p.filter(s => s.id !== id));
    toast({ title: 'Shift Deleted' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Shifts</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage work shifts for your organization</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create Shift</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shifts.map(shift => (
          <Card key={shift.id} className="overflow-hidden">
            <div className={`h-1.5 w-full ${shift.color}`} />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{shift.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(shift)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteShift(shift.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Start Time</p>
                  <p className="mt-1 font-bold text-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{shift.startTime}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">End Time</p>
                  <p className="mt-1 font-bold text-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{shift.endTime}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Working Hrs</p>
                  <p className="mt-1 font-bold text-foreground flex items-center gap-1"><Timer className="h-3.5 w-3.5" />{shift.workingHours}h</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Grace</p>
                  <p className="mt-1 font-bold text-foreground">{shift.graceMinutes} min</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Weekly Off</p>
                <div className="flex flex-wrap gap-1">
                  {shift.weeklyOff.length > 0 ? shift.weeklyOff.map(d => (
                    <Badge key={d} variant="secondary" className="text-[10px]">{d.slice(0, 3)}</Badge>
                  )) : <span className="text-xs text-muted-foreground">None</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />{shift.assignedCount} employees assigned
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editShift ? 'Edit Shift' : 'Create Shift'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Shift Name <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. General Shift" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Time <span className="text-destructive">*</span></Label>
                <Input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>End Time <span className="text-destructive">*</span></Label>
                <Input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Grace Period (minutes)</Label>
              <Input type="number" min="0" max="60" value={form.graceMinutes} onChange={e => setForm(p => ({ ...p, graceMinutes: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Weekly Off Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(d => (
                  <button key={d} onClick={() => toggleDay(d)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${form.weeklyOff.includes(d) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {SHIFT_COLORS.map(c => (
                  <button key={c.value} onClick={() => setForm(p => ({ ...p, color: c.value }))}
                    className={`h-7 w-7 rounded-full ${c.value} transition-all ${form.color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`} title={c.label} />
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              Working hours: <strong>{calcHours(form.startTime, form.endTime)}h</strong>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editShift ? 'Update' : 'Create'} Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

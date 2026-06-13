'use client';

import { useEffect, useMemo, useState } from 'react';
import { attendancePolicyApi, shiftApi } from '@/lib/api';
import {
  AttendancePolicy,
  DefaultFullDayRule,
  PolicyDayType,
  PolicyShiftRef,
  PolicyStatus,
  Shift,
  WeekDay,
  WeekRule,
} from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Calendar,
  Clock,
  Plus,
  Save,
  Settings2,
  Star,
  Trash2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PolicyFormState = {
  policyName: string;
  shiftId: string;
  defaultFullDayRule: DefaultFullDayRule;
  weekRules: WeekRule[];
  autoAbsentEnabled: boolean;
  allowRegularization: boolean;
  isDefault: boolean;
};

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const DAY_SHORT: Record<string, string> = {
  MON: 'M', TUE: 'T', WED: 'W', THU: 'T', FRI: 'F', SAT: 'S', SUN: 'S',
};
const WEEK_DAYS: Array<{ day: WeekDay; label: string }> = [
  { day: WeekDay.MON, label: 'Mon' },
  { day: WeekDay.TUE, label: 'Tue' },
  { day: WeekDay.WED, label: 'Wed' },
  { day: WeekDay.THU, label: 'Thu' },
  { day: WeekDay.FRI, label: 'Fri' },
  { day: WeekDay.SAT, label: 'Sat' },
  { day: WeekDay.SUN, label: 'Sun' },
];

function parseTimeToMinutes(time?: string): number | null {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function computeExpectedHours(startTime?: string, endTime?: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start == null || end == null || end <= start) return 8;
  return Math.round(((end - start) / 60) * 10) / 10;
}

function formatTime12(time?: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

function buildDefaultWeekRules(): WeekRule[] {
  return WEEK_DAYS.map(({ day }) => {
    if (day === WeekDay.SUN) {
      return { day, dayType: PolicyDayType.WEEKLY_OFF, useDefaultTiming: false };
    }
    if (day === WeekDay.SAT) {
      return { day, dayType: PolicyDayType.HALF_DAY, useDefaultTiming: false };
    }
    return { day, dayType: PolicyDayType.FULL_DAY, useDefaultTiming: true };
  });
}

function getRuleForDay(weekRules: WeekRule[], day: WeekDay): WeekRule {
  return weekRules.find((rule) => rule.day === day) ?? {
    day,
    dayType: PolicyDayType.FULL_DAY,
    useDefaultTiming: true,
  };
}

function buildHalfDayRule(day: WeekDay, defaultRule: DefaultFullDayRule): WeekRule {
  const start = defaultRule.startTime;
  const defaultExpected = computeExpectedHours(defaultRule.startTime, defaultRule.endTime);
  const expected = Math.max(defaultExpected / 2, 1);
  const endMinutes = (parseTimeToMinutes(start) ?? 0) + Math.round(expected * 60);
  return {
    day,
    dayType: PolicyDayType.HALF_DAY,
    useDefaultTiming: false,
    startTime: start,
    endTime: minutesToTime(endMinutes),
    expectedHours: Math.round(expected * 10) / 10,
    graceMinutes: defaultRule.graceMinutes,
  };
}

function getShiftInfo(policy: AttendancePolicy): PolicyShiftRef {
  if (typeof policy.shiftId === 'object' && policy.shiftId) {
    return policy.shiftId;
  }
  return {
    _id: '',
    shiftName: 'Shift',
    startTime: '09:00',
    endTime: '18:00',
    expectedHours: 8,
    graceMinutes: 15,
    status: 'ACTIVE',
  };
}

function buildWeekScheduleLine(weekRules: WeekRule[]): string {
  const byDay = new Map(weekRules.map(r => [r.day, r]));
  const parts: string[] = [];
  let runStart = 0;

  const labelFor = (dayType: PolicyDayType) => {
    if (dayType === PolicyDayType.WEEKLY_OFF) return 'Off';
    if (dayType === PolicyDayType.HALF_DAY) return 'Half';
    return 'Full';
  };

  const sameType = (a: WeekRule | undefined, b: WeekRule | undefined) =>
    a?.dayType === b?.dayType && Boolean(a?.useDefaultTiming) === Boolean(b?.useDefaultTiming);

  const days = DAY_ORDER as unknown as WeekDay[];
  for (let i = 1; i <= days.length; i += 1) {
    const prev = byDay.get(days[i - 1]);
    const curr = i < days.length ? byDay.get(days[i]) : undefined;
    if (!sameType(prev, curr)) {
      const startDay = days[runStart];
      const endDay = days[i - 1];
      const typeLabel = labelFor(prev?.dayType ?? PolicyDayType.FULL_DAY);
      const range =
        startDay === endDay ? DAY_SHORT[startDay] : `${DAY_SHORT[startDay]}\u2013${DAY_SHORT[endDay]}`;
      parts.push(`${range} ${typeLabel}`);
      runStart = i;
    }
  }

  return parts.join(' \u00B7 ');
}

export default function AttendancePoliciesPage() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AttendancePolicy | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AttendancePolicy | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [form, setForm] = useState<PolicyFormState>(() => {
    const defaultRule: DefaultFullDayRule = {
      startTime: '09:00',
      endTime: '18:00',
      expectedHours: 9,
      graceMinutes: 15,
    };
    return {
      policyName: '',
      shiftId: '',
      defaultFullDayRule: defaultRule,
      weekRules: buildDefaultWeekRules(),
      autoAbsentEnabled: true,
      allowRegularization: true,
      isDefault: false,
    };
  });

  const selectedShift = useMemo(
    () => shifts.find((s) => s._id === form.shiftId),
    [shifts, form.shiftId]
  );

  const filteredPolicies = useMemo(() => {
    if (statusFilter === 'ALL') return policies;
    return policies.filter((p) => p.status === statusFilter);
  }, [policies, statusFilter]);

  const activeCount = policies.filter((p) => p.status === PolicyStatus.ACTIVE).length;
  const defaultCount = policies.filter((p) => p.isDefault).length;

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setIsLoading(true);
      const data = await attendancePolicyApi.getAll();
      setPolicies(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load attendance policies',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = (policy?: AttendancePolicy) => {
    if (policy) {
      const shiftId =
        typeof policy.shiftId === 'object' ? policy.shiftId?._id : (policy.shiftId ?? '');
      setForm({
        policyName: policy.policyName,
        shiftId,
        defaultFullDayRule: policy.defaultFullDayRule ?? { startTime: '09:00', endTime: '18:00', expectedHours: 9, graceMinutes: 15 },
        weekRules: policy.weekRules,
        autoAbsentEnabled: policy.autoAbsentEnabled,
        allowRegularization: policy.allowRegularization,
        isDefault: policy.isDefault,
      });
      return;
    }

    const defaultRule: DefaultFullDayRule = {
      startTime: '09:00',
      endTime: '18:00',
      expectedHours: 9,
      graceMinutes: 15,
    };
    setForm({
      policyName: '',
      shiftId: '',
      defaultFullDayRule: defaultRule,
      weekRules: buildDefaultWeekRules(),
      autoAbsentEnabled: true,
      allowRegularization: true,
      isDefault: false,
    });
  };

  const loadShifts = async () => {
    try {
      const data = await shiftApi.getAll('ACTIVE');
      setShifts(Array.isArray(data) ? data : []);
    } catch {
      setShifts([]);
    }
  };

  const handleShiftChange = (shiftId: string) => {
    const shift = shifts.find((s) => s._id === shiftId);
    if (!shift) return;
    setForm((prev) => ({
      ...prev,
      shiftId,
      defaultFullDayRule: {
        startTime: shift.startTime,
        endTime: shift.endTime,
        expectedHours: shift.expectedHours,
        graceMinutes: shift.graceMinutes,
      },
      weekRules: prev.weekRules.map((rule) => {
        if (rule.dayType === PolicyDayType.FULL_DAY) {
          return { ...rule, useDefaultTiming: true, startTime: undefined, endTime: undefined, expectedHours: undefined, graceMinutes: undefined };
        }
        return rule;
      }),
    }));
  };

  const openAddDialog = async () => {
    setEditingPolicy(null);
    resetForm();
    await loadShifts();
    setIsDialogOpen(true);
  };

  const openEditDialog = async (policy: AttendancePolicy) => {
    setEditingPolicy(policy);
    resetForm(policy);
    await loadShifts();
    setIsDialogOpen(true);
  };

  const applyWeekRule = (day: WeekDay, update: Partial<WeekRule>) => {
    setForm((prev) => ({
      ...prev,
      weekRules: prev.weekRules.map((rule) =>
        rule.day === day ? { ...rule, ...update } : rule
      ),
    }));
  };

  const setDayType = (day: WeekDay, dayType: PolicyDayType) => {
    if (dayType === PolicyDayType.WEEKLY_OFF) {
      applyWeekRule(day, {
        dayType,
        useDefaultTiming: false,
        startTime: undefined,
        endTime: undefined,
        expectedHours: undefined,
        graceMinutes: undefined,
      });
      return;
    }

    if (dayType === PolicyDayType.HALF_DAY) {
      applyWeekRule(day, buildHalfDayRule(day, form.defaultFullDayRule));
      return;
    }

    applyWeekRule(day, {
      dayType: PolicyDayType.FULL_DAY,
      useDefaultTiming: true,
      startTime: undefined,
      endTime: undefined,
      expectedHours: undefined,
      graceMinutes: undefined,
    });
  };

  const handleSave = async () => {
    if (!form.policyName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Policy name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!form.shiftId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a shift',
        variant: 'destructive',
      });
      return;
    }

    const payload: Record<string, unknown> = {
      policyName: form.policyName.trim(),
      shiftId: form.shiftId,
      weekRules: form.weekRules.map((rule) => {
        if (rule.dayType === PolicyDayType.FULL_DAY) {
          return rule.useDefaultTiming
            ? { day: rule.day, dayType: rule.dayType, useDefaultTiming: true }
            : { ...rule, expectedHours: computeExpectedHours(rule.startTime, rule.endTime) };
        }
        if (rule.dayType === PolicyDayType.HALF_DAY) {
          return {
            ...rule,
            expectedHours: computeExpectedHours(rule.startTime, rule.endTime),
          };
        }
        return { day: rule.day, dayType: rule.dayType, useDefaultTiming: false };
      }),
      autoAbsentEnabled: form.autoAbsentEnabled,
      allowRegularization: form.allowRegularization,
    };

    if (form.isDefault) payload.isDefault = true;

    try {
      setIsSaving(true);
      if (editingPolicy) {
        await attendancePolicyApi.update(editingPolicy._id, payload);
        toast({ title: 'Policy Updated', description: 'Attendance policy updated successfully.' });
      } else {
        await attendancePolicyApi.create(payload);
        toast({ title: 'Policy Created', description: 'Attendance policy created successfully.' });
      }
      setIsDialogOpen(false);
      await loadPolicies();
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.response?.data?.error || 'Failed to save policy',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (policy: AttendancePolicy) => {
    try {
      await attendancePolicyApi.setDefault(policy._id);
      toast({ title: 'Default Updated', description: `${policy.policyName} is now default.` });
      await loadPolicies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to set default policy',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (policy: AttendancePolicy) => {
    const nextStatus = policy.status === PolicyStatus.ACTIVE ? PolicyStatus.INACTIVE : PolicyStatus.ACTIVE;
    try {
      await attendancePolicyApi.updateStatus(policy._id, nextStatus);
      toast({
        title: 'Status Updated',
        description: `${policy.policyName} is now ${nextStatus.toLowerCase()}.`,
      });
      await loadPolicies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update policy status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete._id);
    try {
      await attendancePolicyApi.delete(confirmDelete._id);
      toast({ title: 'Deleted', description: 'Policy deleted successfully.' });
      await loadPolicies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete policy',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Attendance Policies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage shift-based weekly attendance rules</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Policy
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-2xl font-bold">{policies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <Clock className="h-4 w-4 text-green-500" />
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <Star className="h-4 w-4 text-yellow-500" />
            <CardTitle className="text-sm font-medium">Default</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-2xl font-bold">{defaultCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['ALL', 'ACTIVE', 'INACTIVE'] as StatusFilter[]).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              statusFilter === filter
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            {filter === 'ALL' ? 'All' : filter === 'ACTIVE' ? 'Active' : 'Inactive'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading policies...</p>
      ) : filteredPolicies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-semibold">
              {policies.length === 0 ? 'No policies yet' : 'No matching policies'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {policies.length === 0
                ? 'Create a policy linked to a shift and weekly schedule.'
                : 'Try a different status filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPolicies.map((policy) => {
            const shift = getShiftInfo(policy);
            const weekLine = buildWeekScheduleLine(policy.weekRules ?? []);
            const isDeleting = deletingId === policy._id;

            return (
              <Card key={policy._id}>
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{policy.policyName}</CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {policy.isDefault && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                      <Badge variant={policy.status === PolicyStatus.ACTIVE ? 'default' : 'outline'}>
                        {policy.status === PolicyStatus.ACTIVE ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {shift.shiftName} &middot; {formatTime12(shift.startTime)} &ndash; {formatTime12(shift.endTime)} &middot; {shift.expectedHours}h
                    </span>
                  </div>

                  {weekLine && (
                    <p className="text-xs font-medium text-foreground">{weekLine}</p>
                  )}

                  <div className="flex gap-1">
                    {(DAY_ORDER as unknown as WeekDay[]).map((day) => {
                      const rule = policy.weekRules?.find((r) => r.day === day);
                      const dayType = rule?.dayType ?? PolicyDayType.FULL_DAY;
                      const isOff = dayType === PolicyDayType.WEEKLY_OFF;
                      const isHalf = dayType === PolicyDayType.HALF_DAY;
                      return (
                        <div
                          key={day}
                          className={`flex-1 flex items-center justify-center rounded-md py-1 text-xs font-bold ${
                            isOff
                              ? 'bg-muted text-muted-foreground'
                              : isHalf
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {DAY_SHORT[day]}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(policy)}>
                      <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={policy.isDefault || policy.status !== PolicyStatus.ACTIVE}
                      onClick={() => handleSetDefault(policy)}
                    >
                      <Star className="mr-1.5 h-3.5 w-3.5" />
                      Set Default
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(policy)}
                      disabled={policy.isDefault && policy.status === PolicyStatus.ACTIVE}
                    >
                      {policy.status === PolicyStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(policy)}
                      disabled={policy.isDefault || isDeleting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[720px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Add Policy'}</DialogTitle>
            <DialogDescription>Define timing rules, grace minutes, and weekly schedule.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="policyName">Policy Name</Label>
              <Input
                id="policyName"
                value={form.policyName}
                onChange={(e) => setForm((prev) => ({ ...prev, policyName: e.target.value }))}
                placeholder="e.g., General Staff Policy"
              />
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Select Shift
                </CardTitle>
                <CardDescription>Choose an existing shift to define base working hours.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shifts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active shifts found. Create a shift first.</p>
                ) : (
                  <div className="space-y-1">
                    <Label htmlFor="shiftSelect">Base Shift</Label>
                    <Select value={form.shiftId} onValueChange={handleShiftChange}>
                      <SelectTrigger id="shiftSelect">
                        <SelectValue placeholder="Select a shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map((shift) => (
                          <SelectItem key={shift._id} value={shift._id}>
                            {shift.shiftName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedShift && (
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                    <p className="font-semibold text-sm">{selectedShift.shiftName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime12(selectedShift.startTime)} &ndash; {formatTime12(selectedShift.endTime)} &middot; {selectedShift.expectedHours}h &middot; {selectedShift.graceMinutes}m grace
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Week rules using shift timing inherit these hours.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  Week Schedule
                </CardTitle>
                <CardDescription>Choose full, half, or off for each day.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {WEEK_DAYS.map(({ day, label }) => {
                  const rule = getRuleForDay(form.weekRules, day);
                  const isFull = rule.dayType === PolicyDayType.FULL_DAY;
                  const isHalf = rule.dayType === PolicyDayType.HALF_DAY;
                  const isOff = rule.dayType === PolicyDayType.WEEKLY_OFF;
                  return (
                    <div key={day} className="rounded-lg border p-3 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="font-semibold">{label}</div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={isFull ? 'default' : 'outline'}
                            onClick={() => setDayType(day, PolicyDayType.FULL_DAY)}
                          >
                            Full
                          </Button>
                          <Button
                            size="sm"
                            variant={isHalf ? 'default' : 'outline'}
                            onClick={() => setDayType(day, PolicyDayType.HALF_DAY)}
                          >
                            Half
                          </Button>
                          <Button
                            size="sm"
                            variant={isOff ? 'default' : 'outline'}
                            onClick={() => setDayType(day, PolicyDayType.WEEKLY_OFF)}
                          >
                            Off
                          </Button>
                        </div>
                      </div>

                      {isFull && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {rule.useDefaultTiming
                              ? 'Default timing'
                              : 'Custom timing'}
                          </span>
                          {rule.useDefaultTiming && (
                            <button
                              type="button"
                              onClick={() =>
                                applyWeekRule(day, {
                                  useDefaultTiming: false,
                                  startTime: form.defaultFullDayRule.startTime,
                                  endTime: form.defaultFullDayRule.endTime,
                                  expectedHours: computeExpectedHours(form.defaultFullDayRule.startTime, form.defaultFullDayRule.endTime),
                                  graceMinutes: form.defaultFullDayRule.graceMinutes,
                                })
                              }
                              className="text-primary underline"
                            >
                              Customize
                            </button>
                          )}
                        </div>
                      )}

                      {(isHalf || (isFull && !rule.useDefaultTiming)) && (
                        <div className="flex flex-wrap gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Start</Label>
                            <Input
                              type="time"
                              value={rule.startTime || form.defaultFullDayRule.startTime}
                              onChange={(e) =>
                                applyWeekRule(day, {
                                  startTime: e.target.value,
                                  useDefaultTiming: false,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">End</Label>
                            <Input
                              type="time"
                              value={rule.endTime || form.defaultFullDayRule.endTime}
                              onChange={(e) =>
                                applyWeekRule(day, {
                                  endTime: e.target.value,
                                  useDefaultTiming: false,
                                })
                              }
                            />
                          </div>
                          {isFull && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => applyWeekRule(day, { useDefaultTiming: true })}
                              className="self-end"
                            >
                              Use default
                            </Button>
                          )}
                        </div>
                      )}

                      {isOff && (
                        <div className="text-xs text-muted-foreground">Marked as weekly off.</div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="h-4 w-4 text-gray-500" />
                  Advanced Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoAbsent" className="font-medium">Auto mark absent</Label>
                    <p className="text-xs text-muted-foreground">Automatically mark absent when no check-in</p>
                  </div>
                  <Switch
                    id="autoAbsent"
                    checked={form.autoAbsentEnabled}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, autoAbsentEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowReg" className="font-medium">Allow regularization</Label>
                    <p className="text-xs text-muted-foreground">Allow employees to request attendance corrections</p>
                  </div>
                  <Switch
                    id="allowReg"
                    checked={form.allowRegularization}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, allowRegularization: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="setDefault" className="font-medium">Organization default</Label>
                    <p className="text-xs text-muted-foreground">
                      {editingPolicy?.isDefault
                        ? 'This is the current default. Set another policy as default to change.'
                        : 'Used when no user or department policy is assigned.'}
                    </p>
                  </div>
                  <Switch
                    id="setDefault"
                    checked={form.isDefault}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isDefault: checked }))}
                    disabled={editingPolicy?.isDefault}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Policy'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{confirmDelete?.policyName}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { attendancePolicyApi } from '@/lib/api';
import {
  AttendancePolicy,
  DefaultFullDayRule,
  PolicyDayType,
  PolicyStatus,
  WeekDay,
  WeekRule,
} from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Plus, Save, Settings2 } from 'lucide-react';

type PolicyFormState = {
  policyName: string;
  defaultFullDayRule: DefaultFullDayRule;
  weekRules: WeekRule[];
  autoAbsentEnabled: boolean;
  allowRegularization: boolean;
};

const GRACE_OPTIONS = [5, 10, 15, 20, 30];
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

function formatTimeLabel(time?: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function buildDefaultWeekRules(): WeekRule[] {
  return WEEK_DAYS.map(({ day }) => {
    if (day === WeekDay.SUN) {
      return { day, dayType: PolicyDayType.WEEKLY_OFF, useDefaultTiming: false };
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

export default function AttendancePoliciesPage() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AttendancePolicy | null>(null);

  const [form, setForm] = useState<PolicyFormState>(() => {
    const defaultRule: DefaultFullDayRule = {
      startTime: '09:00',
      endTime: '18:00',
      expectedHours: 9,
      graceMinutes: 15,
    };
    return {
      policyName: '',
      defaultFullDayRule: defaultRule,
      weekRules: buildDefaultWeekRules(),
      autoAbsentEnabled: true,
      allowRegularization: true,
    };
  });

  const computedExpectedHours = useMemo(
    () => computeExpectedHours(form.defaultFullDayRule.startTime, form.defaultFullDayRule.endTime),
    [form.defaultFullDayRule.startTime, form.defaultFullDayRule.endTime]
  );

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
      setForm({
        policyName: policy.policyName,
        defaultFullDayRule: policy.defaultFullDayRule,
        weekRules: policy.weekRules,
        autoAbsentEnabled: policy.autoAbsentEnabled,
        allowRegularization: policy.allowRegularization,
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
      defaultFullDayRule: defaultRule,
      weekRules: buildDefaultWeekRules(),
      autoAbsentEnabled: true,
      allowRegularization: true,
    });
  };

  const openAddDialog = () => {
    setEditingPolicy(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (policy: AttendancePolicy) => {
    setEditingPolicy(policy);
    resetForm(policy);
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

  const syncWeekRulesToDefault = () => {
    setForm((prev) => ({
      ...prev,
      weekRules: prev.weekRules.map((rule) => {
        if (rule.dayType === PolicyDayType.FULL_DAY) {
          return { ...rule, useDefaultTiming: true, startTime: undefined, endTime: undefined, expectedHours: undefined };
        }
        if (rule.dayType === PolicyDayType.HALF_DAY) {
          return buildHalfDayRule(rule.day, {
            ...prev.defaultFullDayRule,
            expectedHours: computedExpectedHours,
          });
        }
        return rule;
      }),
    }));
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

    const payload = {
      ...form,
      defaultFullDayRule: {
        ...form.defaultFullDayRule,
        expectedHours: computedExpectedHours,
      },
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
    };

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

  const renderPolicySummary = (policy: AttendancePolicy) => {
    const fullDays = policy.weekRules.filter((rule) => rule.dayType === PolicyDayType.FULL_DAY).length;
    const halfDays = policy.weekRules.filter((rule) => rule.dayType === PolicyDayType.HALF_DAY);
    const weeklyOff = policy.weekRules.filter((rule) => rule.dayType === PolicyDayType.WEEKLY_OFF).length;
    const fullDayRange = `${formatTimeLabel(policy.defaultFullDayRule.startTime)} - ${formatTimeLabel(
      policy.defaultFullDayRule.endTime
    )}`;

    const halfDayLabel = halfDays.length > 0
      ? `${halfDays[0].day}: ${formatTimeLabel(halfDays[0].startTime)} - ${formatTimeLabel(halfDays[0].endTime)}`
      : 'None';

    return (
      <div className="space-y-2 text-sm text-muted-foreground">
        <div>
          <span className="font-semibold text-foreground">Full Day</span> {fullDayRange} - {policy.defaultFullDayRule.expectedHours}h - grace {policy.defaultFullDayRule.graceMinutes}m - {fullDays} full day(s)
        </div>
        <div>
          <span className="font-semibold text-foreground">Half Day</span> {halfDayLabel}
        </div>
        <div>
          <span className="font-semibold text-foreground">Weekly Off</span> {weeklyOff} day(s) off
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Attendance Policies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage working hours, grace minutes, and weekly schedules</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Policy
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading policies...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {policies.map((policy) => (
            <Card key={policy._id}>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{policy.policyName}</CardTitle>
                    <CardDescription>{policy.status === PolicyStatus.ACTIVE ? 'Active policy' : 'Inactive policy'}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {policy.isDefault && <Badge>Default</Badge>}
                    <Badge variant={policy.status === PolicyStatus.ACTIVE ? 'secondary' : 'outline'}>
                      {policy.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderPolicySummary(policy)}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(policy)}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={policy.isDefault || policy.status !== PolicyStatus.ACTIVE}
                    onClick={() => handleSetDefault(policy)}
                  >
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
                </div>
              </CardContent>
            </Card>
          ))}
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
                  Full Day Hours
                </CardTitle>
                <CardDescription>Set default working hours and grace minutes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="defaultStart">Start</Label>
                    <Input
                      id="defaultStart"
                      type="time"
                      value={form.defaultFullDayRule.startTime}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          defaultFullDayRule: {
                            ...prev.defaultFullDayRule,
                            startTime: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="defaultEnd">End</Label>
                    <Input
                      id="defaultEnd"
                      type="time"
                      value={form.defaultFullDayRule.endTime}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          defaultFullDayRule: {
                            ...prev.defaultFullDayRule,
                            endTime: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Expected</Label>
                    <div className="rounded-md border px-3 py-2 text-sm">
                      {computedExpectedHours}h
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Grace Minutes</Label>
                  <div className="flex flex-wrap gap-2">
                    {GRACE_OPTIONS.map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            defaultFullDayRule: {
                              ...prev.defaultFullDayRule,
                              graceMinutes: minutes,
                            },
                          }))
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          form.defaultFullDayRule.graceMinutes === minutes
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {minutes}m
                      </button>
                    ))}
                    <Input
                      type="number"
                      min={0}
                      max={120}
                      value={form.defaultFullDayRule.graceMinutes}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          defaultFullDayRule: {
                            ...prev.defaultFullDayRule,
                            graceMinutes: Number(e.target.value),
                          },
                        }))
                      }
                      className="h-8 w-20"
                    />
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={syncWeekRulesToDefault}>
                  Sync hours
                </Button>
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
                                  expectedHours: computedExpectedHours,
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
    </div>
  );
}

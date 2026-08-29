'use client';

import { useState, type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { IndianRupee, Save, Percent, Clock, Briefcase, HelpCircle } from 'lucide-react';

type Policies = {
  lopCalculationBasis: string;
  autoDeductLopOnAbsent: boolean;
  lateCheckInPenalty: boolean;
  lateDaysThreshold: number;
  penaltyLopDays: number;

  enableOvertime: boolean;
  minOtMinsPerDay: number;
  otMultiplier: number;
  maxOtHoursPerMonth: number;

  holidayPayMultiplier: number;
  weeklyOffPayMultiplier: number;

  enablePfContribution: boolean;
  pfEmployerPercent: number;
  pfEmployeePercent: number;
  enableEsiContribution: boolean;
  esiEmployerPercent: number;
  esiEmployeePercent: number;
};

const DEFAULT_POLICIES: Policies = {
  lopCalculationBasis: 'calendar_days',
  autoDeductLopOnAbsent: true,
  lateCheckInPenalty: true,
  lateDaysThreshold: 3,
  penaltyLopDays: 0.5,

  enableOvertime: true,
  minOtMinsPerDay: 60,
  otMultiplier: 1.5,
  maxOtHoursPerMonth: 40,

  holidayPayMultiplier: 2.0,
  weeklyOffPayMultiplier: 1.5,

  enablePfContribution: true,
  pfEmployerPercent: 12.0,
  pfEmployeePercent: 12.0,
  enableEsiContribution: false,
  esiEmployerPercent: 3.25,
  esiEmployeePercent: 0.75,
};

/** Switch + label + helper text, used for every on/off policy toggle. */
function PolicyToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/** Number input + label + unit suffix, used for every numeric policy value. */
function PolicyNumberField({
  id,
  label,
  value,
  suffix,
  step,
  helperText,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  step?: string;
  helperText?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          id={id}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
        />
        {suffix && <span className="shrink-0 text-xs font-semibold text-muted-foreground">{suffix}</span>}
      </div>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}

/** Indented sub-section shown only while its parent toggle is enabled. */
function ExpandableSection({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return <div className="space-y-4 border-l-2 border-primary/20 pl-6">{children}</div>;
}

export default function PayrollPoliciesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [policies, setPolicies] = useState<Policies>(DEFAULT_POLICIES);
  const [savedPolicies, setSavedPolicies] = useState<Policies>(DEFAULT_POLICIES);

  const isDirty = JSON.stringify(policies) !== JSON.stringify(savedPolicies);

  const set = <K extends keyof Policies>(key: K, value: Policies[K]) =>
    setPolicies(p => ({ ...p, [key]: value }));

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSavedPolicies(policies);
      toast({
        title: 'Payroll Policy Saved',
        description: 'Payroll configurations stored locally. Backend integration pending.',
      });
    }, 600);
  };

  const handleRevert = () => {
    setPolicies(savedPolicies);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Payroll Policies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure Loss of Pay (LOP) calculations, overtime multipliers, and statutory tax parameters
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading || !isDirty} className="shadow-md">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Policies'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Loss of Pay (LOP) Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-red-500" />
              Loss of Pay (LOP) Settings
            </CardTitle>
            <CardDescription>
              Establish deduction guidelines for unmarked days and late attendance penalties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="lopBasis">Deduction Calculation Month-Basis</Label>
              <Select
                value={policies.lopCalculationBasis}
                onValueChange={val => set('lopCalculationBasis', val)}
              >
                <SelectTrigger id="lopBasis">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calendar_days">Actual Calendar Days (28/29/30/31)</SelectItem>
                  <SelectItem value="fixed_30">Fixed 30 Days Every Month</SelectItem>
                  <SelectItem value="work_days">Only Scheduled Working Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <hr className="border-border/60" />

            <PolicyToggleRow
              id="autoLop"
              label="Auto-Deduct LOP on Absents"
              description="Automatically trigger salary deductions for days flagged as 'Absent' without approved leaves."
              checked={policies.autoDeductLopOnAbsent}
              onCheckedChange={v => set('autoDeductLopOnAbsent', v)}
            />

            <hr className="border-border/60" />

            <PolicyToggleRow
              id="latePenalty"
              label="Late Check-In Penalties"
              description="Apply fractional LOP deductions for repetitive late check-in behaviors."
              checked={policies.lateCheckInPenalty}
              onCheckedChange={v => set('lateCheckInPenalty', v)}
            />

            {policies.lateCheckInPenalty && (
              <div className="space-y-4 rounded-lg border-l-2 border-primary/20 bg-muted/40 p-4 pl-6 text-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Late Check-Ins Count</Label>
                    <Input
                      type="number"
                      value={policies.lateDaysThreshold}
                      onChange={e => set('lateDaysThreshold', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Penalty LOP Days Deducted</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={policies.penaltyLopDays}
                      onChange={e => set('penaltyLopDays', Number(e.target.value))}
                    />
                  </div>
                </div>
                <p className="text-[11px] font-medium text-amber-700">
                  Currently: {policies.lateDaysThreshold} late check-ins will lead to {policies.penaltyLopDays} LOP
                  day deduction.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overtime Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              Overtime (OT) Pay Guide
            </CardTitle>
            <CardDescription>Determine pay calculations for hours worked outside standard shift times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <PolicyToggleRow
              id="otEnable"
              label="Calculate & Compensate Overtime"
              description="Approve OT requests on hours worked past scheduled shift bounds."
              checked={policies.enableOvertime}
              onCheckedChange={v => set('enableOvertime', v)}
            />

            <ExpandableSection show={policies.enableOvertime}>
              <PolicyNumberField
                id="otMins"
                label="Min OT Duration / Day (Minutes)"
                value={policies.minOtMinsPerDay}
                suffix="mins"
                helperText="Minimum overtime duration per shift to qualify for OT benefits."
                onChange={v => set('minOtMinsPerDay', v)}
              />

              <div className="grid grid-cols-2 gap-4">
                <PolicyNumberField
                  id="otMultiplier"
                  label="Compensation Multiplier"
                  value={policies.otMultiplier}
                  step="0.1"
                  suffix="x"
                  onChange={v => set('otMultiplier', v)}
                />
                <PolicyNumberField
                  id="maxOtHours"
                  label="Max OT Limit / Month"
                  value={policies.maxOtHoursPerMonth}
                  suffix="hrs"
                  onChange={v => set('maxOtHoursPerMonth', v)}
                />
              </div>
            </ExpandableSection>
          </CardContent>
        </Card>

        {/* Holiday and Rest Day Pay Multipliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IndianRupee className="h-5 w-5 text-emerald-500" />
              Special Rest-Day Multipliers
            </CardTitle>
            <CardDescription>Setup payroll adjustments for working on non-business days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <PolicyNumberField
                id="holidayMultiplier"
                label="Company Holiday Multiplier"
                value={policies.holidayPayMultiplier}
                step="0.1"
                suffix="x rate"
                helperText="Multiplies base daily compensation when working on holidays."
                onChange={v => set('holidayPayMultiplier', v)}
              />
              <PolicyNumberField
                id="weeklyOffMultiplier"
                label="Weekly Off-Day Multiplier"
                value={policies.weeklyOffPayMultiplier}
                step="0.1"
                suffix="x rate"
                helperText="Multiplies base daily compensation when working on rest days."
                onChange={v => set('weeklyOffPayMultiplier', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Statutory Contributions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="h-5 w-5 text-indigo-500" />
              Statutory Contributions (PF / ESI)
            </CardTitle>
            <CardDescription>Configure default deductions for Provident Fund (PF) and State Insurance (ESI)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <PolicyToggleRow
              id="pfEnable"
              label="Calculate Provident Fund (PF)"
              description="Enable auto deductions and contributions for Employee Provident Fund."
              checked={policies.enablePfContribution}
              onCheckedChange={v => set('enablePfContribution', v)}
            />

            <ExpandableSection show={policies.enablePfContribution}>
              <div className="grid grid-cols-2 gap-4">
                <PolicyNumberField
                  id="pfEmployer"
                  label="Employer PF Contribution (%)"
                  value={policies.pfEmployerPercent}
                  step="0.01"
                  suffix="%"
                  onChange={v => set('pfEmployerPercent', v)}
                />
                <PolicyNumberField
                  id="pfEmployee"
                  label="Employee PF Contribution (%)"
                  value={policies.pfEmployeePercent}
                  step="0.01"
                  suffix="%"
                  onChange={v => set('pfEmployeePercent', v)}
                />
              </div>
            </ExpandableSection>

            <hr className="border-border/60" />

            <PolicyToggleRow
              id="esiEnable"
              label="Calculate State Insurance (ESIC)"
              description="Enable state insurance deductions based on wage brackets."
              checked={policies.enableEsiContribution}
              onCheckedChange={v => set('enableEsiContribution', v)}
            />

            <ExpandableSection show={policies.enableEsiContribution}>
              <div className="grid grid-cols-2 gap-4">
                <PolicyNumberField
                  id="esiEmployer"
                  label="Employer ESIC (%)"
                  value={policies.esiEmployerPercent}
                  step="0.01"
                  suffix="%"
                  onChange={v => set('esiEmployerPercent', v)}
                />
                <PolicyNumberField
                  id="esiEmployee"
                  label="Employee ESIC (%)"
                  value={policies.esiEmployeePercent}
                  step="0.01"
                  suffix="%"
                  onChange={v => set('esiEmployeePercent', v)}
                />
              </div>
            </ExpandableSection>

            <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs font-medium text-blue-800">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>PF deductions are calculated against Basic salary components only (deducted before tax calculations).</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end gap-3 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {isDirty && <p className="mr-auto self-center text-xs text-muted-foreground">You have unsaved changes</p>}
        <Button variant="outline" onClick={handleRevert} disabled={!isDirty || isLoading}>
          Revert Changes
        </Button>
        <Button onClick={handleSave} disabled={isLoading || !isDirty}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Policies'}
        </Button>
      </div>
    </div>
  );
}

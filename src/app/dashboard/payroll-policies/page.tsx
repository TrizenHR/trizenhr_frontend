'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { IndianRupee, Save, Percent, Clock, Briefcase, HelpCircle } from 'lucide-react';

export default function PayrollPoliciesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Policy Form State
  const [policies, setPolicies] = useState({
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
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Payroll Policy Saved',
        description: 'Payroll configurations stored locally. Backend integration pending.',
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Payroll Policies</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure Loss of Pay (LOP) calculations, overtime multipliers, and statutory tax parameters</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="shadow-md">
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
            <CardDescription>Establish deduction guidelines for unmarked days and late attendance penalties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="lopBasis">Deduction Calculation Month-Basis</Label>
              <Select
                value={policies.lopCalculationBasis}
                onValueChange={val => setPolicies(p => ({ ...p, lopCalculationBasis: val }))}
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

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="autoLop">Auto-Deduct LOP on Absents</Label>
                <p className="text-xs text-muted-foreground">Automatically trigger salary deductions for days flagged as 'Absent' without approved leaves.</p>
              </div>
              <Switch
                id="autoLop"
                checked={policies.autoDeductLopOnAbsent}
                onCheckedChange={checked => setPolicies(p => ({ ...p, autoDeductLopOnAbsent: checked }))}
              />
            </div>

            <hr className="border-border/60" />

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="latePenalty">Late Check-In Penalties</Label>
                <p className="text-xs text-muted-foreground">Apply fractional LOP deductions for repetitive late check-in behaviors.</p>
              </div>
              <Switch
                id="latePenalty"
                checked={policies.lateCheckInPenalty}
                onCheckedChange={checked => setPolicies(p => ({ ...p, lateCheckInPenalty: checked }))}
              />
            </div>

            {policies.lateCheckInPenalty && (
              <div className="rounded-lg bg-muted/40 p-4 space-y-4 text-sm pl-6 border-l-2 border-primary/20">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Late Check-Ins Count</Label>
                    <Input
                      type="number"
                      value={policies.lateDaysThreshold}
                      onChange={e => setPolicies(p => ({ ...p, lateDaysThreshold: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Penalty LOP Days Deducted</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={policies.penaltyLopDays}
                      onChange={e => setPolicies(p => ({ ...p, penaltyLopDays: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-amber-700 font-medium">Currently: {policies.lateDaysThreshold} late check-ins will lead to {policies.penaltyLopDays} LOP day deduction.</p>
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
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="otEnable">Calculate & Compensate Overtime</Label>
                <p className="text-xs text-muted-foreground">Approve OT requests on hours worked past scheduled shift bounds.</p>
              </div>
              <Switch
                id="otEnable"
                checked={policies.enableOvertime}
                onCheckedChange={checked => setPolicies(p => ({ ...p, enableOvertime: checked }))}
              />
            </div>

            {policies.enableOvertime && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div className="space-y-1.5">
                  <Label htmlFor="otMins">Min OT Duration / Day (Minutes)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      id="otMins"
                      value={policies.minOtMinsPerDay}
                      onChange={e => setPolicies(p => ({ ...p, minOtMinsPerDay: Number(e.target.value) }))}
                    />
                    <span className="text-xs text-muted-foreground">mins</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum overtime duration per shift to qualify for OT benefits.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="otMultiplier">Compensation Multiplier</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        id="otMultiplier"
                        value={policies.otMultiplier}
                        onChange={e => setPolicies(p => ({ ...p, otMultiplier: Number(e.target.value) }))}
                      />
                      <span className="text-xs text-muted-foreground">x</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maxOtHours">Max OT Limit / Month</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        id="maxOtHours"
                        value={policies.maxOtHoursPerMonth}
                        onChange={e => setPolicies(p => ({ ...p, maxOtHoursPerMonth: Number(e.target.value) }))}
                      />
                      <span className="text-xs text-muted-foreground">hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              <div className="space-y-1.5">
                <Label htmlFor="holidayMultiplier">Company Holiday Multiplier</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    id="holidayMultiplier"
                    value={policies.holidayPayMultiplier}
                    onChange={e => setPolicies(p => ({ ...p, holidayPayMultiplier: Number(e.target.value) }))}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">x rate</span>
                </div>
                <p className="text-xs text-muted-foreground">Multiplies base daily compensation when working on holidays.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weeklyOffMultiplier">Weekly Off-Day Multiplier</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    id="weeklyOffMultiplier"
                    value={policies.weeklyOffPayMultiplier}
                    onChange={e => setPolicies(p => ({ ...p, weeklyOffPayMultiplier: Number(e.target.value) }))}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">x rate</span>
                </div>
                <p className="text-xs text-muted-foreground">Multiplies base daily compensation when working on rest days.</p>
              </div>
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
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="pfEnable">Calculate Provident Fund (PF)</Label>
                <p className="text-xs text-muted-foreground">Enable auto deductions and contributions for Employee Provident Fund.</p>
              </div>
              <Switch
                id="pfEnable"
                checked={policies.enablePfContribution}
                onCheckedChange={checked => setPolicies(p => ({ ...p, enablePfContribution: checked }))}
              />
            </div>

            {policies.enablePfContribution && (
              <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20">
                <div className="space-y-1.5">
                  <Label htmlFor="pfEmployer">Employer PF Contribution (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      id="pfEmployer"
                      value={policies.pfEmployerPercent}
                      onChange={e => setPolicies(p => ({ ...p, pfEmployerPercent: Number(e.target.value) }))}
                    />
                    <span className="text-xs text-muted-foreground font-semibold">%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pfEmployee">Employee PF Contribution (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      id="pfEmployee"
                      value={policies.pfEmployeePercent}
                      onChange={e => setPolicies(p => ({ ...p, pfEmployeePercent: Number(e.target.value) }))}
                    />
                    <span className="text-xs text-muted-foreground font-semibold">%</span>
                  </div>
                </div>
              </div>
            )}

            <hr className="border-border/60" />

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="esiEnable">Calculate State Insurance (ESIC)</Label>
                <p className="text-xs text-muted-foreground">Enable state insurance deductions based on wage brackets.</p>
              </div>
              <Switch
                id="esiEnable"
                checked={policies.enableEsiContribution}
                onCheckedChange={checked => setPolicies(p => ({ ...p, enableEsiContribution: checked }))}
              />
            </div>

            {policies.enableEsiContribution && (
              <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20">
                <div className="space-y-1.5">
                  <Label htmlFor="esiEmployer">Employer ESIC (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      id="esiEmployer"
                      value={policies.esiEmployerPercent}
                      onChange={e => setPolicies(p => ({ ...p, esiEmployerPercent: Number(e.target.value) }))}
                    />
                    <span className="text-xs text-muted-foreground font-semibold">%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="esiEmployee">Employee ESIC (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      id="esiEmployee"
                      value={policies.esiEmployeePercent}
                      onChange={e => setPolicies(p => ({ ...p, esiEmployeePercent: Number(e.target.value) }))}
                    />
                    <span className="text-xs text-muted-foreground font-semibold">%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 items-start bg-blue-500/10 text-blue-800 rounded-lg p-3 text-xs border border-blue-500/20 font-medium">
              <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>PF deductions are calculated against Basic salary components only (deducted before tax calculations).</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => window.location.reload()}>Revert Changes</Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Policies'}
        </Button>
      </div>
    </div>
  );
}

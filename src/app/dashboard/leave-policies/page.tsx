'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, GitMerge, FileSpreadsheet, Percent, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LeavePoliciesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Policy state
  const [policies, setPolicies] = useState({
    sickLeaveLimit: 12,
    sickLeaveCarryForward: false,
    sickLeaveMaxCarry: 0,
    
    casualLeaveLimit: 10,
    casualLeaveCarryForward: false,
    casualLeaveMaxCarry: 0,
    
    vacationLeaveLimit: 15,
    vacationLeaveCarryForward: true,
    vacationLeaveMaxCarry: 5,
    
    unpaidLeaveLimit: 90,

    allowEncashment: true,
    encashmentPercentage: 100,
    encashmentExpiryYears: 2,

    multiLevelApproval: true,
    managerFirstApproval: true,
    hrSecondApproval: true,
    allowSelfApprovalForManagers: false,
    autoApproveAfterDays: 7,
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Leave Policy Saved',
        description: 'Leave configuration stored locally. Backend integration pending.',
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Leave Policies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage leave type allotments, encashment programs, and multi-level approval workflows</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="shadow-md">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Policies'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leave Type Allotments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              Annual Allotments & Rollover Policies
            </CardTitle>
            <CardDescription>Configure yearly quotas and carry-forward rules for default leave types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Sick Leave Card */}
              <div className="rounded-xl border border-border/70 p-4 space-y-4 bg-muted/20">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-blue-600 bg-blue-50/20 border-blue-200 font-bold uppercase">Sick Leave</Badge>
                </div>
                <div className="space-y-1.5">
                  <Label>Annual Limit (Days)</Label>
                  <Input
                    type="number"
                    value={policies.sickLeaveLimit}
                    onChange={e => setPolicies(p => ({ ...p, sickLeaveLimit: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-muted-foreground">Carry Forward</span>
                  <Switch
                    checked={policies.sickLeaveCarryForward}
                    onCheckedChange={checked => setPolicies(p => ({ ...p, sickLeaveCarryForward: checked }))}
                  />
                </div>
                {policies.sickLeaveCarryForward && (
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs">Max Carry Forward (Days)</Label>
                    <Input
                      type="number"
                      value={policies.sickLeaveMaxCarry}
                      onChange={e => setPolicies(p => ({ ...p, sickLeaveMaxCarry: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>

              {/* Casual Leave Card */}
              <div className="rounded-xl border border-border/70 p-4 space-y-4 bg-muted/20">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-amber-600 bg-amber-50/20 border-amber-200 font-bold uppercase">Casual Leave</Badge>
                </div>
                <div className="space-y-1.5">
                  <Label>Annual Limit (Days)</Label>
                  <Input
                    type="number"
                    value={policies.casualLeaveLimit}
                    onChange={e => setPolicies(p => ({ ...p, casualLeaveLimit: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-muted-foreground">Carry Forward</span>
                  <Switch
                    checked={policies.casualLeaveCarryForward}
                    onCheckedChange={checked => setPolicies(p => ({ ...p, casualLeaveCarryForward: checked }))}
                  />
                </div>
                {policies.casualLeaveCarryForward && (
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs">Max Carry Forward (Days)</Label>
                    <Input
                      type="number"
                      value={policies.casualLeaveMaxCarry}
                      onChange={e => setPolicies(p => ({ ...p, casualLeaveMaxCarry: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>

              {/* Vacation Leave Card */}
              <div className="rounded-xl border border-border/70 p-4 space-y-4 bg-muted/20">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-50/20 border-emerald-200 font-bold uppercase">Vacation Leave</Badge>
                </div>
                <div className="space-y-1.5">
                  <Label>Annual Limit (Days)</Label>
                  <Input
                    type="number"
                    value={policies.vacationLeaveLimit}
                    onChange={e => setPolicies(p => ({ ...p, vacationLeaveLimit: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-muted-foreground">Carry Forward</span>
                  <Switch
                    checked={policies.vacationLeaveCarryForward}
                    onCheckedChange={checked => setPolicies(p => ({ ...p, vacationLeaveCarryForward: checked }))}
                  />
                </div>
                {policies.vacationLeaveCarryForward && (
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs">Max Carry Forward (Days)</Label>
                    <Input
                      type="number"
                      value={policies.vacationLeaveMaxCarry}
                      onChange={e => setPolicies(p => ({ ...p, vacationLeaveMaxCarry: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Workflows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitMerge className="h-5 w-5 text-indigo-500" />
              Approval Workflow Configuration
            </CardTitle>
            <CardDescription>Setup request approval tiers and escalation timelines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="multiLevel">Require Multi-Level Approval</Label>
                <p className="text-xs text-muted-foreground">Force requests to be verified by supervisor before HR operations.</p>
              </div>
              <Switch
                id="multiLevel"
                checked={policies.multiLevelApproval}
                onCheckedChange={checked => setPolicies(p => ({ ...p, multiLevelApproval: checked }))}
              />
            </div>

            {policies.multiLevelApproval && (
              <div className="space-y-3.5 pl-6 border-l-2 border-primary/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">1st Level Approval: Team Supervisor</span>
                  <Switch checked={policies.managerFirstApproval} disabled />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">2nd Level Approval: HR Operations</span>
                  <Switch
                    checked={policies.hrSecondApproval}
                    onCheckedChange={checked => setPolicies(p => ({ ...p, hrSecondApproval: checked }))}
                  />
                </div>
              </div>
            )}

            <hr className="border-border/60" />

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="selfApprove">Allow Self-Approval for Supervisors</Label>
                <p className="text-xs text-muted-foreground">Skip supervisor approvals if the requester is themselves a department supervisor.</p>
              </div>
              <Switch
                id="selfApprove"
                checked={policies.allowSelfApprovalForManagers}
                onCheckedChange={checked => setPolicies(p => ({ ...p, allowSelfApprovalForManagers: checked }))}
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="autoActionDays">Escalate / Auto-Approve Timeline (Days)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  id="autoActionDays"
                  value={policies.autoApproveAfterDays}
                  onChange={e => setPolicies(p => ({ ...p, autoApproveAfterDays: Number(e.target.value) }))}
                />
                <span className="text-xs text-muted-foreground font-semibold">days</span>
              </div>
              <p className="text-xs text-muted-foreground">Automatically actions request if pending without response after this timeline.</p>
            </div>
          </CardContent>
        </Card>

        {/* Leave Encashment Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="h-5 w-5 text-emerald-500" />
              Leave Encashment Rules
            </CardTitle>
            <CardDescription>Setup parameters for converting accrued leave to financial compensation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="allowEncashment">Enable Leave Encashment</Label>
                <p className="text-xs text-muted-foreground">Allow employees to encash outstanding Vacation leaves during tenure or exit.</p>
              </div>
              <Switch
                id="allowEncashment"
                checked={policies.allowEncashment}
                onCheckedChange={checked => setPolicies(p => ({ ...p, allowEncashment: checked }))}
              />
            </div>

            {policies.allowEncashment && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div className="space-y-1.5">
                  <Label htmlFor="encashPercent">Compensation Value Ratio (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      id="encashPercent"
                      max="100"
                      min="10"
                      value={policies.encashmentPercentage}
                      onChange={e => setPolicies(p => ({ ...p, encashmentPercentage: Number(e.target.value) }))}
                    />
                    <span className="text-xs text-muted-foreground font-semibold">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Determines percentage value paid out relative to employee daily base rate.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expiryYears">Allotted Leave Expiry Bounds (Years)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      id="expiryYears"
                      value={policies.encashmentExpiryYears}
                      onChange={e => setPolicies(p => ({ ...p, encashmentExpiryYears: Number(e.target.value) }))}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">Years</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 items-start bg-blue-500/10 text-blue-800 rounded-lg p-3 text-xs border border-blue-500/20 font-medium">
              <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Leave balance calculations use fiscal year settings configured in Organization settings.</p>
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

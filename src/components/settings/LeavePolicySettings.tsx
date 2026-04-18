'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Info } from 'lucide-react';

interface LeavePolicySettingsProps {
  leavePolicy: {
    sickLeave: number;
    casualLeave: number;
    vacationLeave: number;
  };
  onChange: (leavePolicy: { sickLeave: number; casualLeave: number; vacationLeave: number }) => void;
}

export default function LeavePolicySettings({
  leavePolicy,
  onChange,
}: LeavePolicySettingsProps) {
  const handleSickLeaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onChange({ ...leavePolicy, sickLeave: Math.max(0, value) });
  };

  const handleCasualLeaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onChange({ ...leavePolicy, casualLeave: Math.max(0, value) });
  };

  const handleVacationLeaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onChange({ ...leavePolicy, vacationLeave: Math.max(0, value) });
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
      <CardHeader className="border-b border-border/60 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
          <CardTitle className="text-base font-semibold tracking-tight">Leave policy</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Configure annual leave allocations for employees.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="sickLeave" className="text-[11px] font-semibold text-muted-foreground">
              Sick leave (days)
            </Label>
            <Input
              id="sickLeave"
              type="number"
              min="0"
              value={leavePolicy.sickLeave}
              onChange={handleSickLeaveChange}
              className="h-10 w-full rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="casualLeave" className="text-[11px] font-semibold text-muted-foreground">
              Casual leave (days)
            </Label>
            <Input
              id="casualLeave"
              type="number"
              min="0"
              value={leavePolicy.casualLeave}
              onChange={handleCasualLeaveChange}
              className="h-10 w-full rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vacationLeave" className="text-[11px] font-semibold text-muted-foreground">
              Vacation leave (days)
            </Label>
            <Input
              id="vacationLeave"
              type="number"
              min="0"
              value={leavePolicy.vacationLeave}
              onChange={handleVacationLeaveChange}
              className="h-10 w-full rounded-xl"
            />
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/15 p-3">
          <Info className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Leave balances reset at the start of each fiscal year. Unpaid leave has no limit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

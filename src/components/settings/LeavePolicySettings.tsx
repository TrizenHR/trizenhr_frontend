'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle>Leave Policy</CardTitle>
        </div>
        <CardDescription>
          Configure annual leave allocations for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sickLeave">Sick Leave (Days)</Label>
            <Input
              id="sickLeave"
              type="number"
              min="0"
              value={leavePolicy.sickLeave}
              onChange={handleSickLeaveChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Annual allocation for sick leave
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="casualLeave">Casual Leave (Days)</Label>
            <Input
              id="casualLeave"
              type="number"
              min="0"
              value={leavePolicy.casualLeave}
              onChange={handleCasualLeaveChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Annual allocation for casual leave
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacationLeave">Vacation Leave (Days)</Label>
            <Input
              id="vacationLeave"
              type="number"
              min="0"
              value={leavePolicy.vacationLeave}
              onChange={handleVacationLeaveChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Annual allocation for vacation leave
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These allocations are applied per employee per year. Leave
            balances are automatically reset at the start of each fiscal year. Unpaid leave has no
            limit and can be requested at any time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

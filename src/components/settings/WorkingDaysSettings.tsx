'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarDays, Info } from 'lucide-react';
import { WeeklyOffPattern } from '@/lib/types';

interface WorkingDaysSettingsProps {
  workingDays: {
    weeklyOffPattern: WeeklyOffPattern;
  };
  onChange: (workingDays: { weeklyOffPattern: WeeklyOffPattern }) => void;
}

const patterns: { value: WeeklyOffPattern; label: string; description: string }[] = [
  {
    value: WeeklyOffPattern.MON_FRI,
    label: 'Monday – Friday',
    description: 'Saturday and Sunday off',
  },
  {
    value: WeeklyOffPattern.MON_SAT,
    label: 'Monday – Saturday',
    description: 'Sunday off only',
  },
  {
    value: WeeklyOffPattern.SECOND_FOURTH_SAT,
    label: 'Mon–Sat (2nd & 4th Sat off)',
    description: 'Sunday off; 2nd and 4th Saturday off',
  },
];

export default function WorkingDaysSettings({ workingDays, onChange }: WorkingDaysSettingsProps) {
  const selected =
    patterns.find((p) => p.value === workingDays.weeklyOffPattern) ?? patterns[0];

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
      <CardHeader className="border-b border-border/60 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
          <CardTitle className="text-base font-semibold tracking-tight">Working days & weekly off</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Defines which days count as working days for attendance, leave, and payroll.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="weeklyOffPattern" className="text-[11px] font-semibold text-muted-foreground">
            Weekly off pattern
          </Label>
          <Select
            value={workingDays.weeklyOffPattern}
            onValueChange={(value) =>
              onChange({ weeklyOffPattern: value as WeeklyOffPattern })
            }
          >
            <SelectTrigger id="weeklyOffPattern" className="h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {patterns.map((pattern) => (
                <SelectItem key={pattern.value} value={pattern.value}>
                  {pattern.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{selected.description}</p>
        </div>

        <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/15 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            National and company holidays (from Manage Holidays) are also treated as non-working days.
            Optional holidays do not block attendance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

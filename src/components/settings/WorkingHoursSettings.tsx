'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, Info } from 'lucide-react';

interface WorkingHoursSettingsProps {
  workingHours: {
    startTime: string;
    endTime: string;
  };
  onChange: (workingHours: { startTime: string; endTime: string }) => void;
}

export default function WorkingHoursSettings({
  workingHours,
  onChange,
}: WorkingHoursSettingsProps) {
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...workingHours, startTime: e.target.value });
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...workingHours, endTime: e.target.value });
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
      <CardHeader className="border-b border-border/60 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
          <CardTitle className="text-base font-semibold tracking-tight">Working hours</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Set the standard start and end time for the workday.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startTime" className="text-[11px] font-semibold text-muted-foreground">
              Start time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={workingHours.startTime}
              onChange={handleStartTimeChange}
              className="h-10 w-full rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endTime" className="text-[11px] font-semibold text-muted-foreground">
              End time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={workingHours.endTime}
              onChange={handleEndTimeChange}
              className="h-10 w-full rounded-xl"
            />
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/15 p-3">
          <Info className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            These hours are used for attendance expectations (e.g. late check-ins).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

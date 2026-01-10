'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <CardTitle>Working Hours</CardTitle>
        </div>
        <CardDescription>
          Configure the standard working hours for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={workingHours.startTime}
              onChange={handleStartTimeChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              The time when employees should start their workday
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={workingHours.endTime}
              onChange={handleEndTimeChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              The time when employees should end their workday
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These working hours are used to calculate late arrivals and
            determine standard attendance expectations. Employees checking in after the start time
            will be marked as late.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

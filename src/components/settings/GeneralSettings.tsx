'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Info } from 'lucide-react';

interface GeneralSettingsProps {
  timezone: string;
  fiscalYearStart: number;
  onChange: (updates: { timezone?: string; fiscalYearStart?: number }) => void;
}

const timezones = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
];

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export default function GeneralSettings({
  timezone,
  fiscalYearStart,
  onChange,
}: GeneralSettingsProps) {
  const handleTimezoneChange = (value: string) => {
    onChange({ timezone: value });
  };

  const handleFiscalYearStartChange = (value: string) => {
    onChange({ fiscalYearStart: parseInt(value) });
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
      <CardHeader className="border-b border-border/60 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
          <CardTitle className="text-base font-semibold tracking-tight">General</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Configure timezone and fiscal year behavior.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="timezone" className="text-[11px] font-semibold text-muted-foreground">
              Timezone
            </Label>
            <Select value={timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger id="timezone" className="h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fiscalYearStart" className="text-[11px] font-semibold text-muted-foreground">
              Fiscal year start
            </Label>
            <Select
              value={fiscalYearStart.toString()}
              onValueChange={handleFiscalYearStartChange}
            >
              <SelectTrigger id="fiscalYearStart" className="h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/15 p-3">
          <Info className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Leave balances reset at the fiscal year start. Attendance and leave records use the selected
            timezone.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

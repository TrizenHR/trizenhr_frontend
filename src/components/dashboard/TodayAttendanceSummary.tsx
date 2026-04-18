'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodayAttendanceSummaryProps {
  stats: {
    present: number;
    late: number;
    absent: number;
    onLeave: number;
    total?: number;
  };
  title?: string;
}

export function TodayAttendanceSummary({
  stats,
  title = "Today's Attendance",
}: TodayAttendanceSummaryProps) {
  /* Blue & white only: differentiate rows with borders + blue intensity */
  const items = [
    {
      label: 'Present',
      count: stats.present,
      icon: CheckCircle2,
      panel: 'border-blue-200 bg-blue-50/80 text-blue-900',
      iconWrap: 'bg-white text-blue-700 ring-1 ring-blue-100',
    },
    {
      label: 'Late',
      count: stats.late,
      icon: Clock,
      panel: 'border-blue-100 bg-white text-blue-900',
      iconWrap: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
    },
    {
      label: 'Absent',
      count: stats.absent,
      icon: XCircle,
      panel: 'border-blue-300/60 bg-blue-50 text-blue-950',
      iconWrap: 'bg-white text-blue-800 ring-1 ring-blue-200',
    },
    {
      label: 'On Leave',
      count: stats.onLeave,
      icon: Calendar,
      panel: 'border-blue-100 bg-gradient-to-br from-blue-50 to-white text-blue-900',
      iconWrap: 'bg-white text-blue-600 ring-1 ring-blue-100',
    },
  ];

  return (
    <Card className="border-blue-100 bg-white shadow-sm ring-1 ring-blue-950/5">
      <CardHeader>
        <CardTitle className="text-lg text-blue-950">{title}</CardTitle>
        {stats.total !== undefined && (
          <CardDescription className="text-blue-900/65">
            Total tracked today: <span className="font-semibold text-blue-950">{stats.total}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  'flex flex-col items-center rounded-xl border p-4 text-center shadow-sm',
                  item.panel
                )}
              >
                <span
                  className={cn(
                    'mb-2 flex h-10 w-10 items-center justify-center rounded-full',
                    item.iconWrap
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="text-2xl font-bold tabular-nums">{item.count}</div>
                <div className="mt-1 text-xs font-medium text-blue-900/70">{item.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

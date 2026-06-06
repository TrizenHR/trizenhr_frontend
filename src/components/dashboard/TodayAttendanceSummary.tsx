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
  const items = [
    {
      label: 'Present',
      count: stats.present,
      icon: CheckCircle2,
      panel: 'border-blue-500/30 bg-blue-50 text-foreground',
      iconWrap: 'bg-blue-100 text-blue-600 ring-1 ring-blue-500/20',
    },
    {
      label: 'Late',
      count: stats.late,
      icon: Clock,
      panel: 'border-purple-500/30 bg-purple-50 text-foreground',
      iconWrap: 'bg-purple-100 text-purple-600 ring-1 ring-purple-500/20',
    },
    {
      label: 'Absent',
      count: stats.absent,
      icon: XCircle,
      panel: 'border-red-500/30 bg-red-50 text-foreground',
      iconWrap: 'bg-red-100 text-red-600 ring-1 ring-red-500/20',
    },
    {
      label: 'On Leave',
      count: stats.onLeave,
      icon: Calendar,
      panel: 'border-orange-500/30 bg-orange-50 text-foreground',
      iconWrap: 'bg-orange-100 text-orange-600 ring-1 ring-orange-500/20',
    },
  ];

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm ring-1 ring-border/40">
      <CardHeader className="pt-5">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">{title}</CardTitle>
        {stats.total !== undefined && (
          <CardDescription className="text-sm">
            Total tracked today: <span className="font-semibold text-foreground">{stats.total}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  'flex flex-col items-center rounded-xl border p-3.5 text-center shadow-sm',
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
                <div className="text-xl font-bold tabular-nums">{item.count}</div>
                <div className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

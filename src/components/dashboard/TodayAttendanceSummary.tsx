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
      panel: 'border-primary/25 bg-primary/5 text-foreground',
      iconWrap: 'bg-background text-primary ring-1 ring-primary/15',
    },
    {
      label: 'Late',
      count: stats.late,
      icon: Clock,
      panel: 'border-border bg-card text-foreground',
      iconWrap: 'bg-primary/10 text-primary ring-1 ring-primary/10',
    },
    {
      label: 'Absent',
      count: stats.absent,
      icon: XCircle,
      panel: 'border-border/80 bg-muted/40 text-foreground',
      iconWrap: 'bg-background text-primary ring-1 ring-border',
    },
    {
      label: 'On Leave',
      count: stats.onLeave,
      icon: Calendar,
      panel: 'border-primary/15 bg-gradient-to-br from-primary/5 to-card text-foreground',
      iconWrap: 'bg-background text-primary ring-1 ring-primary/10',
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

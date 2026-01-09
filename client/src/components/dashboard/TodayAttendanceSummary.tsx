'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react';

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
  title = "Today's Attendance" 
}: TodayAttendanceSummaryProps) {
  const items = [
    { label: 'Present', count: stats.present, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Late', count: stats.late, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Absent', count: stats.absent, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'On Leave', count: stats.onLeave, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {stats.total !== undefined && (
          <p className="text-sm text-muted-foreground">Total: {stats.total}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`flex flex-col items-center p-3 rounded-lg ${item.bg}`}>
                <Icon className={`h-5 w-5 mb-1 ${item.color}`} />
                <div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
                <div className="text-xs text-gray-600">{item.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

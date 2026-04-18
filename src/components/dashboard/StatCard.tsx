import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'border-blue-100 bg-white shadow-sm ring-1 ring-blue-950/5 transition-shadow hover:shadow-md',
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <CardTitle className="text-sm font-medium leading-snug text-blue-900/75">{title}</CardTitle>
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight text-blue-950">{value}</div>
        {(description || trend) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {trend && (
              <span
                className={cn(
                  'font-semibold',
                  trend.isPositive ? 'text-blue-700' : 'text-blue-500'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            )}
            {description && <span className="text-blue-900/55">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

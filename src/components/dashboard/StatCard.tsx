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
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'default';
}

const colorVariants = {
  blue: {
    border: 'border-l-4 border-l-blue-500',
    iconBg: 'bg-blue-500/10 text-blue-600 ring-blue-500/15',
  },
  green: {
    border: 'border-l-4 border-l-green-500',
    iconBg: 'bg-green-500/10 text-green-600 ring-green-500/15',
  },
  orange: {
    border: 'border-l-4 border-l-orange-500',
    iconBg: 'bg-orange-500/10 text-orange-600 ring-orange-500/15',
  },
  purple: {
    border: 'border-l-4 border-l-purple-500',
    iconBg: 'bg-purple-500/10 text-purple-600 ring-purple-500/15',
  },
  red: {
    border: 'border-l-4 border-l-red-500',
    iconBg: 'bg-red-500/10 text-red-600 ring-red-500/15',
  },
  default: {
    border: '',
    iconBg: 'bg-primary/10 text-primary ring-1 ring-primary/15',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  color = 'default',
}: StatCardProps) {
  const colorStyle = colorVariants[color];

  return (
    <Card
      className={cn(
        'gap-0 overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm ring-1 ring-border/40 transition-all hover:shadow-md',
        colorStyle.border,
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2 pt-4">
        <CardTitle className="text-[11px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1', colorStyle.iconBg)}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</div>
        {(description || trend) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {trend && (
              <span
                className={cn(
                  'font-semibold',
                  trend.isPositive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            )}
            {description && <span className="text-muted-foreground">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

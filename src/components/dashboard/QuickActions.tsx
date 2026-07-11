'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/types';
import type { Attendance } from '@/lib/types';
import {
  Camera,
  Calendar,
  Users,
  FileText,
  UserPlus,
  ClipboardCheck,
  Building2,
  Settings,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  userRole: UserRole;
  todayAttendance?: Attendance | null;
  onCheckOut?: () => void;
}

type ActionColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'default';

interface ActionItem {
  label: string;
  href: string;
  icon: any;
  color?: ActionColor;
}

const colorVariants: Record<ActionColor, { icon: string; hover: string }> = {
  blue: {
    icon: 'bg-blue-100 text-blue-600 ring-blue-200',
    hover: 'hover:border-blue-500/25 hover:bg-blue-50',
  },
  green: {
    icon: 'bg-green-100 text-green-600 ring-green-200',
    hover: 'hover:border-green-500/25 hover:bg-green-50',
  },
  orange: {
    icon: 'bg-orange-100 text-orange-600 ring-orange-200',
    hover: 'hover:border-orange-500/25 hover:bg-orange-50',
  },
  purple: {
    icon: 'bg-purple-100 text-purple-600 ring-purple-200',
    hover: 'hover:border-purple-500/25 hover:bg-purple-50',
  },
  red: {
    icon: 'bg-red-100 text-red-600 ring-red-200',
    hover: 'hover:border-red-500/25 hover:bg-red-50',
  },
  default: {
    icon: 'bg-primary/10 text-primary ring-primary/10',
    hover: 'hover:border-primary/25 hover:bg-muted/50',
  },
};

const roleActions: Record<UserRole, ActionItem[]> = {
  [UserRole.EMPLOYEE]: [
    { label: 'Check In', href: '/dashboard/my-attendance', icon: Camera, color: 'green' },
    { label: 'View Attendance', href: '/dashboard/my-attendance', icon: ClipboardCheck, color: 'blue' },
    { label: 'Request Leave', href: '/dashboard/my-leave', icon: Calendar, color: 'orange' },
  ],
  [UserRole.SUPERVISOR]: [
    { label: 'View Team', href: '/dashboard/team-attendance', icon: Users, color: 'blue' },
    { label: 'Approve Leaves', href: '/dashboard/leave-approvals', icon: Calendar, color: 'orange' },
    { label: 'Team Attendance', href: '/dashboard/team-attendance', icon: ClipboardCheck, color: 'green' },
  ],
  [UserRole.HR]: [
    { label: 'Add Employee', href: '/dashboard/users/create', icon: UserPlus, color: 'green' },
    { label: 'Leave Approvals', href: '/dashboard/leave-approvals', icon: Calendar, color: 'orange' },
    { label: 'View Attendance', href: '/dashboard/team-attendance', icon: ClipboardCheck, color: 'blue' },
  ],
  [UserRole.ADMIN]: [
    { label: 'Manage Users', href: '/dashboard/users', icon: Users, color: 'blue' },
    { label: 'Company Attendance', href: '/dashboard/attendance', icon: ClipboardCheck, color: 'green' },
    { label: 'Reports', href: '/dashboard/reports', icon: FileText, color: 'orange' },
  ],
  [UserRole.SUPER_ADMIN]: [
    { label: 'Create Organization', href: '/dashboard/organizations', icon: Building2, color: 'blue' },
    { label: 'View All Orgs', href: '/dashboard/organizations', icon: Building2, color: 'green' },
    { label: 'System Settings', href: '/dashboard/settings', icon: Settings, color: 'orange' },
  ],
};

export function QuickActions({ userRole, todayAttendance, onCheckOut }: QuickActionsProps) {
  const actions = roleActions[userRole] || [];

  // For employee: determine check-in/check-out state
  const hasCheckedIn = userRole === UserRole.EMPLOYEE && todayAttendance?.checkIn != null;
  const hasCheckedOut = userRole === UserRole.EMPLOYEE && todayAttendance?.checkOut != null;

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm ring-1 ring-border/40">
      <CardHeader className="space-y-1 pb-2 pt-5">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Quick Actions</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Shortcuts to the tasks you use most often
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 pt-1 pb-5 sm:gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          const colorStyle = colorVariants[action.color || 'default'];

          // For employee "Check In" action — swap to "Check Out" if checked in
          if (userRole === UserRole.EMPLOYEE && action.label === 'Check In') {
            if (hasCheckedOut) {
              // Already completed — show a disabled "Completed" indicator
              return (
                <div
                  key="attendance-status"
                  className="h-auto justify-start gap-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-3.5 text-left"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 ring-1 ring-green-200">
                      <ClipboardCheck className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">Attendance Completed</span>
                  </span>
                </div>
              );
            }

            if (hasCheckedIn && onCheckOut) {
              // Show Check Out button
              return (
                <Button
                  key="checkout"
                  variant="outline"
                  className={cn(
                    'h-auto justify-start gap-3 rounded-xl border-border/80 bg-background py-3.5 text-left font-medium text-foreground shadow-none transition-colors',
                    colorStyle.hover
                  )}
                  onClick={onCheckOut}
                >
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1', colorStyle.icon)}>
                    <LogOut className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <span>Check Out</span>
                </Button>
              );
            }

            // Default: show Check In link
            return (
              <Button
                key={action.label}
                variant="outline"
                className={cn(
                  'h-auto justify-start gap-3 rounded-xl border-border/80 bg-background py-3.5 text-left font-medium text-foreground shadow-none transition-colors',
                  colorStyle.hover
                )}
                asChild
              >
                <Link href={action.href} className="cursor-pointer">
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1', colorStyle.icon)}>
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <span>{action.label}</span>
                </Link>
              </Button>
            );
          }

          return (
            <Button
              key={action.label}
              variant="outline"
              className={cn(
                'h-auto justify-start gap-3 rounded-xl border-border/80 bg-background py-3.5 text-left font-medium text-foreground shadow-none transition-colors',
                colorStyle.hover
              )}
              asChild
            >
              <Link href={action.href} className="cursor-pointer">
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1', colorStyle.icon)}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span>{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

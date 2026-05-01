'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/types';
import {
  Camera,
  Calendar,
  Users,
  FileText,
  UserPlus,
  ClipboardCheck,
  Building2,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  userRole: UserRole;
}

const roleActions = {
  [UserRole.EMPLOYEE]: [
    { label: 'Check In', href: '/dashboard/my-attendance', icon: Camera },
    { label: 'View Attendance', href: '/dashboard/my-attendance', icon: ClipboardCheck },
    { label: 'Request Leave', href: '/dashboard/my-leave', icon: Calendar },
  ],
  [UserRole.SUPERVISOR]: [
    { label: 'View Team', href: '/dashboard/team-attendance', icon: Users },
    { label: 'Approve Leaves', href: '/dashboard/leave-approvals', icon: Calendar },
    { label: 'Team Attendance', href: '/dashboard/team-attendance', icon: ClipboardCheck },
  ],
  [UserRole.HR]: [
    { label: 'Add Employee', href: '/dashboard/users/create', icon: UserPlus },
    { label: 'View Attendance', href: '/dashboard/team-attendance', icon: ClipboardCheck },
    { label: 'Leave Requests', href: '/dashboard/team-leaves', icon: Calendar },
  ],
  [UserRole.ADMIN]: [
    { label: 'Manage Users', href: '/dashboard/users', icon: Users },
    { label: 'View Attendance', href: '/dashboard/team-attendance', icon: ClipboardCheck },
    { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  ],
  [UserRole.SUPER_ADMIN]: [
    { label: 'Create Organization', href: '/dashboard/organizations', icon: Building2 },
    { label: 'View All Orgs', href: '/dashboard/organizations', icon: Building2 },
    { label: 'System Settings', href: '/dashboard/settings', icon: Settings },
  ],
};

export function QuickActions({ userRole }: QuickActionsProps) {
  const actions = roleActions[userRole] || [];

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
          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl border-border/80 bg-background py-3.5 text-left font-medium text-foreground shadow-none transition-colors hover:border-primary/25 hover:bg-muted/50"
              asChild
            >
              <Link href={action.href} className="cursor-pointer">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
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

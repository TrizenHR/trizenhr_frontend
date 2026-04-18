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
    <Card className="border-blue-100 bg-white shadow-sm ring-1 ring-blue-950/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-950">Quick Actions</CardTitle>
        <CardDescription className="text-blue-900/60">
          Shortcuts to the tasks you use most often
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl border-blue-200 bg-white py-3 text-left font-medium text-blue-900 shadow-none transition-colors hover:border-blue-300 hover:bg-blue-50"
              asChild
            >
              <Link href={action.href} className="cursor-pointer">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-4 w-4" aria-hidden />
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

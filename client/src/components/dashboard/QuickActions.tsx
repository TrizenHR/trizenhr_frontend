'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/types';
import { Camera, Calendar, Users, FileText, UserPlus, ClipboardCheck } from 'lucide-react';
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
    { label: 'View Team', href: '/dashboard/team', icon: Users },
    { label: 'Approve Leaves', href: '/dashboard/team/leave', icon: Calendar },
    { label: 'Team Attendance', href: '/dashboard/team/attendance', icon: ClipboardCheck },
  ],
  [UserRole.HR]: [
    { label: 'Add Employee', href: '/dashboard/users?action=create', icon: UserPlus },
    { label: 'View Attendance', href: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Leave Requests', href: '/dashboard/leave', icon: Calendar },
  ],
  [UserRole.ADMIN]: [
    { label: 'Manage Users', href: '/dashboard/users', icon: Users },
    { label: 'View Attendance', href: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  ],
  [UserRole.SUPER_ADMIN]: [
    { label: 'Manage Users', href: '/dashboard/users', icon: Users },
    { label: 'View Attendance', href: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'System Reports', href: '/dashboard/reports', icon: FileText },
  ],
};

export function QuickActions({ userRole }: QuickActionsProps) {
  const actions = roleActions[userRole] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              className="justify-start"
              asChild
            >
              <Link href={action.href}>
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

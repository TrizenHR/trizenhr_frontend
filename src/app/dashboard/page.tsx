'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { HRDashboard } from '@/components/dashboard/HRDashboard';
import { SupervisorDashboard } from '@/components/dashboard/SupervisorDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-muted border-t-primary"
          aria-hidden
        />
        <p className="text-sm font-medium text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  // Route to role-specific dashboard
  switch (user.role) {
    case UserRole.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.HR:
      return <HRDashboard />;
    case UserRole.SUPERVISOR:
      return <SupervisorDashboard />;
    case UserRole.EMPLOYEE:
      return <EmployeeDashboard />;
    default:
      return (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="max-w-md rounded-2xl border border-border/80 bg-card p-8 text-center shadow-sm ring-1 ring-border/40">
            <p className="font-medium text-foreground">Unknown user role</p>
            <p className="mt-2 text-sm text-muted-foreground">Contact support if this persists.</p>
          </div>
        </div>
      );
  }
}

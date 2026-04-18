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
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600"
          aria-hidden
        />
        <p className="text-sm font-medium text-blue-900/70">Loading your dashboard…</p>
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
          <div className="max-w-md rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm ring-1 ring-blue-950/5">
            <p className="font-medium text-blue-950">Unknown user role</p>
            <p className="mt-2 text-sm text-blue-900/65">Contact support if this persists.</p>
          </div>
        </div>
      );
  }
}

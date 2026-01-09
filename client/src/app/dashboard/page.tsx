'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import { SuperAdminDashboard } from '@/components/dashboard/super-admin-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { HRDashboard } from '@/components/dashboard/hr-dashboard';
import { SupervisorDashboard } from '@/components/dashboard/supervisor-dashboard';
import { EmployeeDashboard } from '@/components/dashboard/employee-dashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
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
        <div className="flex h-full items-center justify-center">
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-700">Unknown user role</p>
          </div>
        </div>
      );
  }
}

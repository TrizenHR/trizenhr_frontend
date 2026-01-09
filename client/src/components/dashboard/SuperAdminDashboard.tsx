'use client';

import { QuickActions } from './QuickActions';
import { TodayAttendanceSummary } from './TodayAttendanceSummary';
import { StatCard } from './StatCard';
import { UserRole } from '@/lib/types';
import { Users, Shield, Activity, Database } from 'lucide-react';

export function SuperAdminDashboard() {
  // TODO: Fetch real data in Phase 3
  const mockStats = {
    totalUsers: 52,
    superAdmins: 1,
    admins: 2,
    hr: 3,
    supervisors: 6,
    employees: 40,
    present: 42,
    late: 4,
    absent: 3,
    onLeave: 3,
  };

  const usersByRole = [
    { role: 'Super Admin', count: mockStats.superAdmins },
    { role: 'Admin', count: mockStats.admins },
    { role: 'HR', count: mockStats.hr },
    { role: 'Supervisor', count: mockStats.supervisors },
    { role: 'Employee', count: mockStats.employees },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Complete system control and monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={mockStats.totalUsers}
          icon={Users}
          description="All roles"
        />
        <StatCard
          title="System Status"
          value="Healthy"
          icon={Activity}
          description="All services running"
        />
        <StatCard
          title="Active Sessions"
          value={mockStats.present}
          icon={Shield}
        />
        <StatCard
          title="Database"
          value="OK"
          icon={Database}
          description="No issues"
        />
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
            <div className="space-y-3">
              {usersByRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.role}</span>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TodayAttendanceSummary
          title="System Attendance Today"
          stats={{
            present: mockStats.present,
            late: mockStats.late,
            absent: mockStats.absent,
            onLeave: mockStats.onLeave,
            total: mockStats.totalUsers,
          }}
        />

        <QuickActions userRole={UserRole.SUPER_ADMIN} />
      </div>
    </div>
  );
}

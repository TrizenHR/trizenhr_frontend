'use client';

import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { hasAnyRole } from '@/lib/permissions';
import { UserRole } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamAttendanceBoard } from '@/components/attendance/TeamAttendanceBoard';
import AttendanceReportsTab from '@/components/reports/AttendanceReportsTab';

export default function CompanyAttendancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily');

  if (!user || !hasAnyRole(user.role, [UserRole.ADMIN, UserRole.HR])) {
    return (
      <div className="p-6">
        <div className="py-12 text-center">
          <ClipboardCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Access denied</h2>
          <p className="text-muted-foreground">
            You do not have permission to view company attendance.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          {isAdmin ? 'Company Attendance' : 'Organization Attendance'}
        </h1>
        <p className="text-muted-foreground">
          Monitor daily attendance, view check-in photos, and browse historical records for your
          organization.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="daily">Daily roster</TabsTrigger>
          <TabsTrigger value="records">All records</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          <TeamAttendanceBoard
            showHeader={false}
            showLocationColumns={isAdmin}
            title={isAdmin ? 'Company Attendance' : 'Organization Attendance'}
            subtitle="Daily attendance for all employees"
            membersTableTitle="Employees"
            exportFilePrefix="company-attendance"
          />
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <AttendanceReportsTab showLocationColumns={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttendanceReportsTab from '@/components/reports/AttendanceReportsTab';
import LeaveReportsTab from '@/components/reports/LeaveReportsTab';
import { useAuth } from '@/hooks/use-auth';
import { hasAnyRole } from '@/lib/permissions';
import { UserRole } from '@/lib/types';

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance');

  // Check if user has access to reports
  if (!user || !hasAnyRole(user.role, [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR])) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">
            You don't have permission to view reports. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate and export attendance and leave reports
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
          <TabsTrigger value="leave">Leave Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceReportsTab />
        </TabsContent>

        <TabsContent value="leave" className="mt-6">
          <LeaveReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

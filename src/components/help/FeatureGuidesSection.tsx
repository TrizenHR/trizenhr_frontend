'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, FileText, Users, Settings, BarChart3 } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface FeatureGuidesSectionProps {
  searchQuery: string;
  userRole: UserRole;
}

const guides = [
  {
    id: 'attendance',
    title: 'Marking Attendance',
    icon: Clock,
    roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
    steps: [
      'Navigate to "My Attendance" from the sidebar',
      'Click the "Check In" button',
      'Allow camera access when prompted',
      'Position your face in the camera frame',
      'Click "Capture Photo" to take your check-in photo',
      'Your attendance is automatically recorded',
      'To check out, click the "Check Out" button at the end of the day',
    ],
    tips: [
      'Make sure you have good lighting for the camera',
      'Check in before your organization\'s start time to avoid being marked late',
      'You can view your attendance history and statistics on the same page',
    ],
  },
  {
    id: 'leave',
    title: 'Requesting Leave',
    icon: Calendar,
    roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
    steps: [
      'Go to "My Leave" from the sidebar',
      'Click "Request Leave" button',
      'Select the leave type (Sick, Casual, Vacation, or Unpaid)',
      'Choose the start date and end date',
      'Enter a reason for your leave request',
      'Click "Submit Request"',
      'Your supervisor/HR will be notified and can approve or reject your request',
    ],
    tips: [
      'Check your leave balance before requesting leave',
      'Submit leave requests in advance whenever possible',
      'You can view the status of your leave requests on the same page',
    ],
  },
  {
    id: 'approve-leave',
    title: 'Approving Leave Requests',
    icon: Users,
    roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
    steps: [
      'Navigate to "Leave Approvals" from the sidebar',
      'View pending leave requests',
      'Click on a request to see details',
      'Review the employee information, dates, and reason',
      'Click "Approve" or "Reject"',
      'Optionally add notes for your decision',
      'The employee will be notified of the decision',
    ],
    tips: [
      'Review leave balances before approving',
      'Check for overlapping leave requests from the same team',
      'You can filter requests by status, date, or employee',
    ],
  },
  {
    id: 'reports',
    title: 'Generating Reports',
    icon: BarChart3,
    roles: [UserRole.HR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    steps: [
      'Go to "Reports" from the sidebar',
      'Select "Attendance Reports" or "Leave Reports" tab',
      'Apply filters (date range, department, status, etc.)',
      'View the filtered results in the table',
      'Click "Export CSV" to download the report',
      'The report will be downloaded as a CSV file',
    ],
    tips: [
      'Use date range filters to get specific period reports',
      'You can filter by department, status, or employee',
      'Reports include all relevant details for payroll and audits',
    ],
  },
  {
    id: 'settings',
    title: 'Configuring Settings',
    icon: Settings,
    roles: [UserRole.ADMIN, UserRole.HR, UserRole.SUPER_ADMIN],
    steps: [
      'Navigate to "Settings" from the sidebar',
      'Select the appropriate tab (Working Hours, Leave Policy, or General)',
      'Modify the settings as needed',
      'Click "Save Changes" when done',
      'Settings are applied immediately to your organization',
    ],
    tips: [
      'Working hours determine late arrival calculations',
      'Leave policy settings affect annual leave allocations',
      'Timezone settings affect all date/time displays',
    ],
  },
  {
    id: 'users',
    title: 'Managing Users',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR],
    steps: [
      'Go to "Users" from the sidebar',
      'Click "Add User" to create a new user',
      'Fill in user details (name, email, role, department)',
      'Set a temporary password',
      'Click "Create User"',
      'The user will receive login credentials',
      'You can edit or delete users from the users table',
    ],
    tips: [
      'Users should change their password on first login',
      'Assign appropriate roles based on responsibilities',
      'Link users to departments for better organization',
    ],
  },
];

export default function FeatureGuidesSection({
  searchQuery,
  userRole,
}: FeatureGuidesSectionProps) {
  // Filter guides based on user role and search query
  const filteredGuides = guides.filter((guide) => {
    const roleMatch = guide.roles.includes(userRole);
    const searchMatch =
      !searchQuery ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.steps.some((step) => step.toLowerCase().includes(searchQuery.toLowerCase()));
    return roleMatch && searchMatch;
  });

  if (filteredGuides.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {searchQuery
          ? `No guides found for "${searchQuery}"`
          : 'No guides available for your role'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredGuides.map((guide) => {
        const Icon = guide.icon;
        return (
          <Card key={guide.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription>
                    Step-by-step guide for {guide.title.toLowerCase()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {guide.steps.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              {guide.tips && guide.tips.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-900">💡 Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                    {guide.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface TroubleshootingSectionProps {
  searchQuery: string;
  userRole: UserRole;
}

const troubleshootingItems = [
  {
    issue: 'Camera not working during check-in',
    solutions: [
      'Check if your browser has camera permissions enabled',
      'Try refreshing the page and allowing camera access again',
      'Make sure no other application is using your camera',
      'Check your browser settings and enable camera access for this site',
      'Try using a different browser if the issue persists',
    ],
    roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
  },
  {
    issue: 'Cannot see attendance records',
    solutions: [
      'Verify you\'re logged in with the correct account',
      'Check if you have the right permissions for your role',
      'Try refreshing the page',
      'Clear your browser cache and cookies',
      'Contact your HR or administrator if the issue persists',
    ],
    roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
  },
  {
    issue: 'Leave request not showing up',
    solutions: [
      'Refresh the page to see the latest requests',
      'Check if you have the correct role permissions',
      'Verify you\'re looking at the right date range',
      'Contact your supervisor or HR if you still can\'t see it',
    ],
    roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
  },
  {
    issue: 'Reports not loading or exporting',
    solutions: [
      'Check your internet connection',
      'Try applying different filters',
      'Clear your browser cache',
      'Make sure you have the necessary permissions',
      'Try exporting a smaller date range',
      'Contact support if the issue continues',
    ],
    roles: [UserRole.HR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    issue: 'Cannot save settings changes',
    solutions: [
      'Make sure you have Admin or HR role permissions',
      'Check if all required fields are filled',
      'Verify your internet connection is stable',
      'Try refreshing the page and making changes again',
      'Contact support if you continue to have issues',
    ],
    roles: [UserRole.ADMIN, UserRole.HR, UserRole.SUPER_ADMIN],
  },
  {
    issue: 'Page loading slowly or not responding',
    solutions: [
      'Check your internet connection speed',
      'Close other browser tabs to free up memory',
      'Clear your browser cache and cookies',
      'Try using a different browser',
      'Disable browser extensions that might interfere',
      'Contact IT support if the problem persists',
    ],
    roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
  },
  {
    issue: 'Cannot login to account',
    solutions: [
      'Verify you\'re using the correct email and password',
      'Check if Caps Lock is on',
      'Try resetting your password if you\'ve forgotten it',
      'Clear browser cache and cookies',
      'Make sure your account is active (contact HR if unsure)',
      'Contact support if you still cannot login',
    ],
    roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
  },
];

export default function TroubleshootingSection({
  searchQuery,
  userRole,
}: TroubleshootingSectionProps) {
  const filteredItems = troubleshootingItems.filter((item) => {
    const roleMatch = item.roles.includes(userRole);
    const searchMatch =
      !searchQuery ||
      item.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.solutions.some((solution) =>
        solution.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return roleMatch && searchMatch;
  });

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {searchQuery
          ? `No troubleshooting items found for "${searchQuery}"`
          : 'No troubleshooting items available for your role'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
          <CardDescription>
            Find solutions to common problems you might encounter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredItems.map((item, index) => (
              <div key={index} className="border-b last:border-b-0 pb-6 last:pb-0">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <h3 className="font-semibold">{item.issue}</h3>
                </div>
                <div className="ml-8 space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">Try these solutions:</p>
                  <ol className="list-decimal list-inside space-y-1.5">
                    {item.solutions.map((solution, solIndex) => (
                      <li key={solIndex} className="text-sm text-muted-foreground">
                        {solution}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Still Need Help?</CardTitle>
          <CardDescription className="text-blue-700">
            If none of these solutions work, contact our support team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Email: support@trizenventures.com</p>
            <p>• Phone: +1 (800) ATTEND</p>
            <p>• Support Hours: Monday-Friday, 9 AM - 6 PM (IST)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

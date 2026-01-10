'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Clock, Users, Shield } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface GettingStartedSectionProps {
  searchQuery: string;
  userRole: UserRole;
}

export default function GettingStartedSection({
  searchQuery,
  userRole,
}: GettingStartedSectionProps) {
  const quickStartSteps = [
    {
      title: '1. Login to Your Account',
      description: 'Use your email and password to access AttendEase dashboard',
      icon: Shield,
    },
    {
      title: '2. Complete Your Profile',
      description: 'Update your personal information and profile picture',
      icon: Users,
    },
    {
      title: '3. Mark Your First Attendance',
      description: 'Use the check-in button to mark your attendance with camera',
      icon: Clock,
    },
  ];

  const filteredSteps = quickStartSteps.filter(
    (step) =>
      !searchQuery ||
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (searchQuery && filteredSteps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No results found for "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>
            Get up and running with AttendEase in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Understanding Your Role</CardTitle>
          <CardDescription>
            Learn what features are available for your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getRoleDescription(userRole)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Overview</CardTitle>
          <CardDescription>
            Learn how to navigate the AttendEase dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Sidebar Navigation</p>
                <p className="text-sm text-muted-foreground">
                  Use the sidebar on the left to access different sections
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Top Header</p>
                <p className="text-sm text-muted-foreground">
                  Access your profile, notifications, and logout from the top right
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Breadcrumbs</p>
                <p className="text-sm text-muted-foreground">
                  Use breadcrumbs to navigate back to previous pages
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getRoleDescription(role: UserRole) {
  const descriptions: Record<UserRole, { title: string; features: string[] }> = {
    [UserRole.EMPLOYEE]: {
      title: 'Employee',
      features: [
        'Mark attendance with camera check-in',
        'View your attendance history and statistics',
        'Request and manage leave',
        'View your leave balance',
        'Access your personal calendar',
        'Update your profile',
      ],
    },
    [UserRole.SUPERVISOR]: {
      title: 'Supervisor',
      features: [
        'All Employee features',
        'View team attendance',
        'Approve/reject team leave requests',
        'View team calendar',
        'Monitor team performance',
      ],
    },
    [UserRole.HR]: {
      title: 'HR',
      features: [
        'All Supervisor features',
        'Manage employees',
        'View all attendance records',
        'Approve/reject all leave requests',
        'Manage holidays',
        'Generate reports',
        'Configure organization settings',
      ],
    },
    [UserRole.ADMIN]: {
      title: 'Admin',
      features: [
        'All HR features',
        'Manage departments',
        'Full system configuration',
        'Access all reports and analytics',
        'Manage organization settings',
      ],
    },
    [UserRole.SUPER_ADMIN]: {
      title: 'Super Admin',
      features: [
        'All Admin features',
        'Manage multiple organizations',
        'Create and manage organizations',
        'Cross-organization user management',
        'Platform-level settings',
      ],
    },
  };

  const desc = descriptions[role];

  return (
    <div>
      <h3 className="font-semibold mb-3">You are logged in as: {desc.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Based on your role, you have access to the following features:
      </p>
      <ul className="space-y-2">
        {desc.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

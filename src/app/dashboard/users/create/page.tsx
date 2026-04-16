'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useCanManageUsers } from '@/hooks/use-auth';
import { userApi } from '@/lib/api';
import { CreateUserFormData } from '@/lib/validations';
import { UserRole } from '@/lib/types';
import { UserForm } from '@/components/forms/user-form';
import { toast } from 'sonner';

export default function CreateUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const canManage = useCanManageUsers() || user?.role === UserRole.SUPER_ADMIN;

  const [isLoading, setIsLoading] = useState(false);

  // Get pre-selected organization from URL if present
  const preSelectedOrgId = searchParams.get('orgId');

  const handleSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true);

    try {
      await userApi.createUser(data);
      toast.success('User created successfully');
      router.push(user?.role === UserRole.HR ? '/dashboard/employees' : '/dashboard/users');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
      setIsLoading(false);
    }
  };

  if (!canManage || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create User</h1>
          <p className="text-gray-500">Add a new user to the system</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Fill in the details for the new user</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            userRole={user.role as UserRole}
            defaultValues={preSelectedOrgId ? { organizationId: preSelectedOrgId } : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}

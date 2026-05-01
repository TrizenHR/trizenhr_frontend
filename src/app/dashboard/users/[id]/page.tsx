'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, useCanManageUsers } from '@/hooks/use-auth';
import { Department, User, UserRole } from '@/lib/types';
import { departmentApi, userApi } from '@/lib/api';
import { toast } from 'sonner';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const canManage = useCanManageUsers() || currentUser?.role === UserRole.SUPER_ADMIN;
  const returnPath = currentUser?.role === UserRole.HR ? '/dashboard/employees' : '/dashboard/users';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    if (!canManage || !params?.id) return;
    loadUser();
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, params?.id]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getUserById(params.id);
      setTargetUser(data);
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setDepartment(data.department || '');
      setEmployeeId(data.employeeId || '');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load user');
      router.push(returnPath);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load departments');
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const handleSave = async () => {
    if (!targetUser) return;
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    try {
      setIsSaving(true);
      await userApi.updateUser(targetUser._id || targetUser.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        department: department.trim() || undefined,
        employeeId: employeeId.trim() || undefined,
      });
      toast.success('User updated successfully');
      router.push(returnPath);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (!canManage || !currentUser) {
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(returnPath)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-500">Update user details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Edit and save user profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={isSaving}
              placeholder="EMP001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={department || '__none__'}
              onValueChange={(value) => setDepartment(value === '__none__' ? '' : value)}
              disabled={isSaving || isLoadingDepartments}
            >
              <SelectTrigger id="department" className="cursor-pointer">
                <SelectValue placeholder={isLoadingDepartments ? 'Loading departments...' : 'Select department'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => router.push(returnPath)} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


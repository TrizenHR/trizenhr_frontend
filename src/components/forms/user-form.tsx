'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { CreateUserFormData, createUserSchema } from '@/lib/validations';
import { UserRole, Organization, Department } from '@/lib/types';
import { getAllowedRolesToCreate, getRoleDisplayName } from '@/lib/permissions';
import { organizationApi, departmentApi, userApi } from '@/lib/api';

interface UserFormProps {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateUserFormData>;
  userRole: UserRole;
}

export function UserForm({ onSubmit, isLoading, defaultValues, userRole }: UserFormProps) {
  const router = useRouter();
  const isOrgScopedCreation = Boolean(defaultValues?.organizationId);
  const allowedRoles = getAllowedRolesToCreate(userRole).filter((role) => {
    if (isOrgScopedCreation && role === UserRole.SUPER_ADMIN) {
      return false;
    }
    return true;
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [employeeIdSuggestions, setEmployeeIdSuggestions] = useState<string[]>([]);
  const [nextEmployeeId, setNextEmployeeId] = useState<string | null>(null);
  const [useCustomEmployeeId, setUseCustomEmployeeId] = useState(false);

  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const isHR = userRole === UserRole.HR;
  const lockEmployeeId = isHR && !useCustomEmployeeId;

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      loadOrganizations();
    }
  }, [isSuperAdmin]);

  // Load departments for dropdown (non–Super Admin is org-scoped)
  useEffect(() => {
    if (!isSuperAdmin) {
      loadDepartments();
    }
  }, [isSuperAdmin]);

  const loadOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const data = await organizationApi.getAll();
      setOrganizations(data.filter((org) => org.isActive));
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const loadDepartments = async () => {
    try {
      setLoadingDepts(true);
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoadingDepts(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: UserRole.EMPLOYEE,
      ...defaultValues,
    },
  });

  // Load suggested next employee ID for org-scoped roles
  useEffect(() => {
    const loadNextEmployeeId = async () => {
      if (isSuperAdmin) return;
      try {
        const { nextEmployeeId, existingSample } = await userApi.getNextEmployeeId();
        setNextEmployeeId(nextEmployeeId);
        setEmployeeIdSuggestions(existingSample);

        // Prefill only when no default employeeId is provided
        if (!defaultValues?.employeeId) {
          setValue('employeeId', nextEmployeeId);
        }
      } catch (error) {
        console.error('Failed to load next employee ID:', error);
      }
    };

    loadNextEmployeeId();
  }, [isSuperAdmin, defaultValues, setValue]);

  const selectedRole = watch('role');
  const selectedOrganization = watch('organizationId');
  const selectedDepartment = watch('department');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Organization Selector - Only for Super Admin */}
      {isSuperAdmin && (
        <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Label htmlFor="organizationId">
            Organization <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedOrganization}
            onValueChange={(value: string) => setValue('organizationId', value)}
            disabled={isLoading || loadingOrgs}
          >
            <SelectTrigger className={errors.organizationId ? 'border-red-500 bg-white' : 'bg-white'}>
              <SelectValue placeholder={loadingOrgs ? 'Loading organizations...' : 'Select organization'} />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org._id} value={org._id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.organizationId && <p className="text-sm text-red-500">{errors.organizationId.message}</p>}
          <p className="text-sm text-blue-700">Select which organization this user belongs to</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            {...register('firstName')}
            disabled={isLoading}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            {...register('lastName')}
            disabled={isLoading}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={isLoading}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          disabled={isLoading}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        <p className="text-sm text-gray-500">Minimum 6 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">
          Role <span className="text-red-500">*</span>
        </Label>
        <Select
          value={selectedRole}
          onValueChange={(value: string) => setValue('role', value as UserRole)}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {allowedRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {getRoleDisplayName(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeeId">
          Employee ID <span className="text-red-500">*</span>
        </Label>
        {isHR && (
          <div className="flex items-center justify-between rounded-md border p-2">
            <Label htmlFor="useCustomEmployeeId" className="text-sm font-normal">
              Use custom Employee ID
            </Label>
            <Switch
              id="useCustomEmployeeId"
              checked={useCustomEmployeeId}
              onCheckedChange={(checked) => {
                setUseCustomEmployeeId(checked);
                if (!checked && nextEmployeeId) {
                  setValue('employeeId', nextEmployeeId);
                }
              }}
              disabled={isLoading}
            />
          </div>
        )}
        <Input
          id="employeeId"
          placeholder={
            lockEmployeeId
              ? nextEmployeeId
                ? `Auto: ${nextEmployeeId}`
                : 'Auto-generated'
              : 'e.g. 6 or EMP006'
          }
          {...register('employeeId')}
          disabled={isLoading}
          readOnly={lockEmployeeId}
          className={[
            errors.employeeId ? 'border-red-500' : '',
            lockEmployeeId ? 'bg-muted cursor-not-allowed' : '',
          ].join(' ').trim()}
        />
        {errors.employeeId && (
          <p className="text-sm text-red-500">{errors.employeeId.message}</p>
        )}
        {lockEmployeeId ? (
          <p className="text-sm text-gray-500">
            Auto-generated for HR. Enable "Use custom Employee ID" to enter a manual value.
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            You can enter digits (e.g. 6) or a code (e.g. EMP006). It will be normalized and stored as EMP###.
          </p>
        )}
        {employeeIdSuggestions.length > 0 && (
          <p className="text-xs text-gray-500">
            Existing IDs: {employeeIdSuggestions.join(', ')}
            {nextEmployeeId ? `. Suggested next: ${nextEmployeeId}` : ''}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select
          value={selectedDepartment ?? '__none__'}
          onValueChange={(value) => setValue('department', value === '__none__' ? '' : value)}
          disabled={isLoading || loadingDepts}
        >
          <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
            <SelectValue placeholder={loadingDepts ? 'Loading departments...' : 'Select department'} />
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
        {errors.department && (
          <p className="text-sm text-red-500">{errors.department.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create User
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

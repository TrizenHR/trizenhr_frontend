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
import { AlertCircle, Loader2 } from 'lucide-react';
import { CreateUserFormData, createUserSchema } from '@/lib/validations';
import { UserRole, Organization, Department } from '@/lib/types';
import { getAllowedRolesToCreate, getRoleDisplayName } from '@/lib/permissions';
import { organizationApi, departmentApi, userApi } from '@/lib/api';
import { toast } from 'sonner';

interface UserFormProps {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateUserFormData>;
  userRole: UserRole;
  /** When set (e.g. ?orgId=), organization is fixed for Super Admin creates */
  lockedOrganizationId?: string;
  /** true = invite company admin only; false = pick HR/manager/employee (?staff=1) */
  inviteCompanyAdmin?: boolean;
}

export function UserForm({
  onSubmit,
  isLoading,
  defaultValues,
  userRole,
  lockedOrganizationId,
  inviteCompanyAdmin = false,
}: UserFormProps) {
  const router = useRouter();
  const isOrgScopedCreation = Boolean(defaultValues?.organizationId) && inviteCompanyAdmin;

  // Super Admin always creates Company Admin — no role selection
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const roleIsLocked = isSuperAdmin;

  const allowedRoles = getAllowedRolesToCreate(userRole).filter((role) => {
    // Super Admin flow: only Company Admin is allowed (no System Admin creation via this form)
    if (isSuperAdmin) return role === UserRole.ADMIN;
    if (isOrgScopedCreation && role === UserRole.SUPER_ADMIN) return false;
    return true;
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [employeeIdSuggestions, setEmployeeIdSuggestions] = useState<string[]>([]);
  const [nextEmployeeId, setNextEmployeeId] = useState<string | null>(null);
  const [loadingEmployeeId, setLoadingEmployeeId] = useState(false);
  const [noDepartmentsWarning, setNoDepartmentsWarning] = useState(false);

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

  const loadDepartments = async (orgId?: string) => {
    try {
      setLoadingDepts(true);
      const data = await departmentApi.getAll(orgId);
      setDepartments(data);
      setNoDepartmentsWarning(data.length === 0);
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
      role: isSuperAdmin ? UserRole.ADMIN : inviteCompanyAdmin ? UserRole.ADMIN : UserRole.EMPLOYEE,
      ...defaultValues,
      ...(isSuperAdmin || inviteCompanyAdmin ? { role: UserRole.ADMIN } : {}),
    },
  });

  const selectedRole = watch('role');
  const selectedOrganization = watch('organizationId');
  const selectedDepartment = watch('department');

  // Lock role to Company Admin for Super Admin, and for org-scoped admin invite
  useEffect(() => {
    if (isSuperAdmin || inviteCompanyAdmin) {
      setValue('role', UserRole.ADMIN);
    }
  }, [isSuperAdmin, inviteCompanyAdmin, setValue]);

  // When Super Admin selects an org, reload departments for that org
  useEffect(() => {
    if (isSuperAdmin && selectedOrganization) {
      loadDepartments(selectedOrganization);
    }
  }, [isSuperAdmin, selectedOrganization]);

  // Re-fetch suggested employee ID whenever role or department changes
  useEffect(() => {
    const loadNextEmployeeId = async () => {
      const orgId =
        lockedOrganizationId ||
        selectedOrganization ||
        defaultValues?.organizationId;

      if (isSuperAdmin && !orgId) return;

      const isAdminRole = selectedRole === UserRole.ADMIN;

      // Non-admin roles need department in the ID — wait for dept selection
      if (!isAdminRole && !selectedDepartment) {
        setNextEmployeeId(null);
        setEmployeeIdSuggestions([]);
        setValue('employeeId', '');
        return;
      }

      try {
        setLoadingEmployeeId(true);
        const { nextEmployeeId: next, existingSample } = await userApi.getNextEmployeeId(
          isSuperAdmin ? orgId : undefined,
          selectedRole,
          isAdminRole ? undefined : selectedDepartment
        );
        setNextEmployeeId(next || null);
        setEmployeeIdSuggestions(existingSample);
        setValue('employeeId', next || '');
      } catch (error) {
        console.error('Failed to load next employee ID:', error);
      } finally {
        setLoadingEmployeeId(false);
      }
    };

    loadNextEmployeeId();
  }, [
    isSuperAdmin,
    lockedOrganizationId,
    selectedOrganization,
    defaultValues?.organizationId,
    selectedRole,
    selectedDepartment,
    setValue,
  ]);

  useEffect(() => {
    if (lockedOrganizationId) {
      setValue('organizationId', lockedOrganizationId);
    }
  }, [lockedOrganizationId, setValue]);

  const onInvalid = (fieldErrors: typeof errors) => {
    const first = Object.values(fieldErrors).find((e) => e?.message);
    toast.error(first?.message || 'Please fill in all required fields.');
  };

  const isAdmin = selectedRole === UserRole.ADMIN;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
      {/* Organization Selector — Super Admin only */}
      {isSuperAdmin && !lockedOrganizationId && (
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
          {errors.organizationId && (
            <p className="text-sm text-red-500">{errors.organizationId.message}</p>
          )}
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
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
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

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">
          Role <span className="text-red-500">*</span>
        </Label>
        {roleIsLocked || isOrgScopedCreation ? (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="font-semibold text-gray-900">{getRoleDisplayName(UserRole.ADMIN)}</span>
            <p className="text-xs text-gray-500 mt-1">
              {isSuperAdmin
                ? 'System Admin can only create Company Admin accounts.'
                : 'Creating the primary administrator for this organization.'}
            </p>
          </div>
        ) : (
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
        )}
        {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
      </div>

      {/* Department — required for non-admin roles */}
      <div className="space-y-2">
        <Label htmlFor="department">
          Department {!isAdmin && <span className="text-red-500">*</span>}
        </Label>

        {!isAdmin && noDepartmentsWarning && (
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              No departments are available for this organization. Please{' '}
              <a
                href="/dashboard/departments"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                create a department
              </a>{' '}
              before adding users. Once created,{' '}
              <button
                type="button"
                className="font-medium underline"
                onClick={() => loadDepartments()}
              >
                click here to refresh
              </button>
              .
            </span>
          </div>
        )}

        <Select
          value={selectedDepartment ?? '__none__'}
          onValueChange={(value) => setValue('department', value === '__none__' ? '' : value)}
          disabled={isLoading || loadingDepts || (!isAdmin && noDepartmentsWarning)}
        >
          <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
            <SelectValue
              placeholder={
                loadingDepts
                  ? 'Loading departments...'
                  : isAdmin
                  ? 'Not applicable for Company Admin'
                  : departments.length === 0
                  ? 'No departments available — create one first'
                  : 'Select department'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {isAdmin && <SelectItem value="__none__">Not applicable</SelectItem>}
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

      {/* Employee ID — always auto-generated, read-only */}
      <div className="space-y-2">
        <Label htmlFor="employeeId">
          Employee ID
          <span className="ml-2 text-xs font-normal text-gray-500">
            {isAdmin
              ? '(org code + role + count  e.g. TRZAD001)'
              : '(org code + dept + role + count  e.g. TRZENЕМ001)'}
          </span>
        </Label>
        <div className="relative">
          <Input
            id="employeeId"
            placeholder={
              loadingEmployeeId
                ? 'Generating...'
                : !isAdmin && !selectedDepartment
                ? 'Select a department first'
                : nextEmployeeId ?? 'Auto-generated on save'
            }
            {...register('employeeId')}
            disabled={isLoading}
            readOnly
            className="bg-muted cursor-not-allowed"
          />
          {loadingEmployeeId && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        {!isAdmin && !selectedDepartment && !noDepartmentsWarning && (
          <p className="text-sm text-amber-600">Select a department to preview the Employee ID.</p>
        )}
        {nextEmployeeId && (
          <p className="text-xs text-gray-500">
            {employeeIdSuggestions.length > 0
              ? `Existing: ${employeeIdSuggestions.join(', ')} · `
              : ''}
            Next: <span className="font-medium text-gray-700">{nextEmployeeId}</span>
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading || (!isAdmin && noDepartmentsWarning)}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create User
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

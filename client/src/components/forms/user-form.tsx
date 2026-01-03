'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { Loader2 } from 'lucide-react';
import { CreateUserFormData, createUserSchema } from '@/lib/validations';
import { UserRole } from '@/lib/types';
import { getAllowedRolesToCreate, getRoleDisplayName } from '@/lib/permissions';

interface UserFormProps {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateUserFormData>;
  userRole: UserRole;
}

export function UserForm({ onSubmit, isLoading, defaultValues, userRole }: UserFormProps) {
  const router = useRouter();
  const allowedRoles = getAllowedRolesToCreate(userRole);

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

  const selectedRole = watch('role');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Label htmlFor="employeeId">Employee ID</Label>
        <Input id="employeeId" {...register('employeeId')} disabled={isLoading} />
        {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" {...register('department')} disabled={isLoading} />
        {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
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

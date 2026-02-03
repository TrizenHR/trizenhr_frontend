import * as z from 'zod';
import { UserRole } from './types';

export const createUserSchema = z.object({
  organizationId: z.string().optional(), // For Super Admin creating users
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole),
  department: z.string().optional(),
  employeeId: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Za-z0-9_-]+$/.test(val),
      'Employee ID can only contain letters, numbers, hyphens and underscores'
    )
    .refine((val) => !val || val.length <= 50, 'Employee ID must be at most 50 characters'),
  supervisorId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

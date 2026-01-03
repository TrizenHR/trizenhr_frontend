import * as z from 'zod';
import { UserRole } from './types';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  supervisorId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

import * as z from 'zod';
import { UserRole } from './types';

export const createUserSchema = z
  .object({
    organizationId: z.string().optional(), // For Super Admin creating users
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.nativeEnum(UserRole),
    department: z.string().optional(),
    employeeId: z.string().optional().or(z.literal('')),
    supervisorId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Department is required for everyone EXCEPT Company Admin (ADMIN)
    if (data.role !== UserRole.ADMIN && (!data.department || !data.department.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Department is required. Please create a department first.',
        path: ['department'],
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

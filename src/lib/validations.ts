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
    employeeId: z
      .string()
      .regex(/^(?:[0-9]+|EMP[0-9]+)$/i, 'Employee ID must be digits (e.g. 6) or code (e.g. EMP006)')
      .optional()
      .or(z.literal('')),
    supervisorId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Employee ID is required for everyone EXCEPT Company Admin (ADMIN)
    if (data.role !== UserRole.ADMIN && !data.employeeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Employee ID is required',
        path: ['employeeId'],
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

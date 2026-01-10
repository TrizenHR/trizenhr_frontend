'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth-context';
import { UserRole } from '@/lib/types';
import { hasPermission, hasAnyRole, canManageUsers, canApproveLeave } from '@/lib/permissions';

/**
 * Hook to access auth context
 * Throws error if used outside AuthProvider
 */
export { useAuth };

/**
 * Hook to require authentication and optional role
 * Redirects to login if not authenticated or insufficient permissions
 */
export function useRequireAuth(requiredRole?: UserRole) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login');
      } else if (requiredRole && !hasPermission(user.role as UserRole, requiredRole)) {
        // Authenticated but insufficient permissions, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, requiredRole, router]);

  return { user, isLoading };
}

/**
 * Check if user has specific role
 */
export function useHasRole(role: UserRole) {
  const { user } = useAuth();
  return user?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function useHasAnyRole(...roles: UserRole[]) {
  const { user } = useAuth();
  if (!user) return false;
  return hasAnyRole(user.role as UserRole, roles);
}

/**
 * Check if user can manage other users (create, edit, delete)
 */
export function useCanManageUsers() {
  const { user } = useAuth();
  if (!user) return false;
  return canManageUsers(user.role as UserRole);
}

/**
 * Check if user can approve leave requests
 */
export function useCanApproveLeave() {
  const { user } = useAuth();
  if (!user) return false;
  return canApproveLeave(user.role as UserRole);
}

/**
 * Check if user is a regular employee
 */
export function useIsEmployee() {
  const { user } = useAuth();
  return user?.role === UserRole.EMPLOYEE;
}

/**
 * Check if user is super admin
 */
export function useIsSuperAdmin() {
  const { user } = useAuth();
  return user?.role === UserRole.SUPER_ADMIN;
}

/**
 * Check if user is admin (not super admin)
 */
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if user is HR
 */
export function useIsHR() {
  const { user } = useAuth();
  return user?.role === UserRole.HR;
}

/**
 * Check if user is supervisor
 */
export function useIsSupervisor() {
  const { user } = useAuth();
  return user?.role === UserRole.SUPERVISOR;
}

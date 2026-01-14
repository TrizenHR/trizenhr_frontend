import { UserRole } from './types';

// Role hierarchy levels (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.HR]: 3,
  [UserRole.SUPERVISOR]: 2,
  [UserRole.EMPLOYEE]: 1,
};

/**
 * Check if user has permission based on role hierarchy
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can create another user with target role
 */
export function canCreateUser(userRole: UserRole, targetRole: UserRole): boolean {
  // Super admin can create anyone
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Admin can create everyone except super admin and other admins
  if (userRole === UserRole.ADMIN) {
    return targetRole !== UserRole.SUPER_ADMIN && targetRole !== UserRole.ADMIN;
  }

  // HR can only create employees
  if (userRole === UserRole.HR) {
    return targetRole === UserRole.EMPLOYEE;
  }

  return false;
}

/**
 * Check if user can edit target user
 */
export function canEditUser(
  userRole: UserRole,
  targetUserRole: UserRole,
  isSelf: boolean
): boolean {
  // Users can edit their own profile (with field restrictions)
  if (isSelf) {
    return true;
  }

  // Super admin can edit anyone
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Admin can edit everyone except super admin
  if (userRole === UserRole.ADMIN) {
    return targetUserRole !== UserRole.SUPER_ADMIN;
  }

  // HR can edit employees
  if (userRole === UserRole.HR) {
    return targetUserRole === UserRole.EMPLOYEE;
  }

  return false;
}

/**
 * Check if user can delete target user
 */
export function canDeleteUser(userRole: UserRole, targetUserRole: UserRole): boolean {
  // Cannot delete super admin
  if (targetUserRole === UserRole.SUPER_ADMIN) {
    return false;
  }

  // Super admin can delete anyone (except other super admins, already checked above)
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Admin can delete everyone except super admin (already checked) and other admins
  if (userRole === UserRole.ADMIN) {
    return targetUserRole !== UserRole.ADMIN;
  }

  return false;
}

/**
 * Check if user can view all users
 */
export function canViewAllUsers(role: UserRole): boolean {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR, UserRole.SUPERVISOR].includes(role);
}

/**
 * Check if user can manage users (create, edit, delete)
 */
export function canManageUsers(role: UserRole): boolean {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR].includes(role);
}

/**
 * Check if user can approve leave requests
 */
export function canApproveLeave(role: UserRole): boolean {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR, UserRole.SUPERVISOR].includes(role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Get allowed roles that a user can assign
 */
export function getAllowedRolesToCreate(userRole: UserRole): UserRole[] {
  if (userRole === UserRole.SUPER_ADMIN) {
    return Object.values(UserRole);
  }

  if (userRole === UserRole.ADMIN) {
    return [UserRole.HR, UserRole.SUPERVISOR, UserRole.EMPLOYEE];
  }

  if (userRole === UserRole.HR) {
    return [UserRole.EMPLOYEE];
  }

  return [];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.HR]: 'HR',
    [UserRole.SUPERVISOR]: 'Supervisor',
    [UserRole.EMPLOYEE]: 'Employee',
  };

  return displayNames[role];
}

/**
 * Get role color for badges
 */
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'bg-purple-100 text-purple-800 border-purple-200',
    [UserRole.ADMIN]: 'bg-blue-100 text-blue-800 border-blue-200',
    [UserRole.HR]: 'bg-green-100 text-green-800 border-green-200',
    [UserRole.SUPERVISOR]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [UserRole.EMPLOYEE]: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return colors[role];
}

/**
 * Check if user can manage payroll (salary structures, payroll runs)
 */
export function canManagePayroll(role: UserRole): boolean {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR].includes(role);
}

/**
 * Check if user can view all payroll data
 */
export function canViewAllPayroll(role: UserRole): boolean {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR].includes(role);
}

/**
 * Check if user can process payroll
 */
export function canProcessPayroll(role: UserRole): boolean {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR].includes(role);
}


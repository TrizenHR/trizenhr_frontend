export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  HR = 'hr',
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee',
}

export interface User {
  _id: string;
  organizationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  dateOfJoining?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    organizationId?: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: UserRole;
    department?: string;
    employeeId?: string;
  };
}

export interface CreateUserPayload {
  organizationId?: string; // For Super Admin creating users in specific organization
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  supervisorId?: string;
  employeeId?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  department?: string;
  supervisorId?: string;
  employeeId?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

// Attendance Types
export enum AttendanceStatus {
  PRESENT = 'present',
  LATE = 'late',
  ABSENT = 'absent',
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
}

export interface Attendance {
  _id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workingHours?: number;
  notes?: string;
  isApproved: boolean;
  approvedBy?: string;
  photoUrl?: string; // Photo captured during check-in
  createdAt: string;
  updatedAt: string;
}

export interface TodayStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  attendance?: Attendance;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  totalWorkingHours: number;
  averageWorkingHours: number;
}

export interface AttendancePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AttendanceFilters {
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
  department?: string;
  page?: number;
  limit?: number;
}

// Leave Types
export enum LeaveType {
  SICK = 'sick',
  CASUAL = 'casual',
  VACATION = 'vacation',
  UNPAID = 'unpaid',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface Leave {
  _id: string;
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
    department?: string;
  };
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveTypeBalance {
  total: number;
  used: number;
  remaining: number;
}

export interface UnpaidLeaveBalance {
  used: number;
}

export interface LeaveBalance {
  _id: string;
  userId: string;
  year: number;
  sickLeave: LeaveTypeBalance;
  casualLeave: LeaveTypeBalance;
  vacationLeave: LeaveTypeBalance;
  unpaidLeave: UnpaidLeaveBalance;
  createdAt: string;
  updatedAt: string;
}

export interface LeavePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeaveRequestPayload {
  leaveType: LeaveType;
  startDate: Date | string;
  endDate: Date | string;
  reason: string;
}

export interface LeaveFilters {
  status?: LeaveStatus;
  leaveType?: LeaveType;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  page?: number;
  limit?: number;
}

// Holiday Types
export enum HolidayType {
  NATIONAL = 'national',
  COMPANY = 'company',
  OPTIONAL = 'optional',
}

export interface Holiday {
  _id: string;
  name: string;
  date: Date;
  type: HolidayType;
  description?: string;
  isRecurring: boolean;
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HolidayFormData {
  name: string;
  date: Date;
  type: HolidayType;
  description?: string;
  isRecurring: boolean;
}

// Department Types
export interface Department {
  _id: string;
  name: string;
  description?: string;
  headOfDepartment?: string | User;
  members: (string | User)[];
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  headOfDepartment?: string;
}

// Organization Types
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface Organization {
  _id: string;
  name: string;
  subdomain?: string;
  isActive: boolean;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry?: string;
  settings: {
    workingHours: {
      startTime: string;
      endTime: string;
    };
    leavePolicy: {
      sickLeave: number;
      casualLeave: number;
      vacationLeave: number;
    };
    timezone: string;
    fiscalYearStart: number;
  };
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationPayload {
  name: string;
  subdomain?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiry?: Date;
  settings?: Partial<Organization['settings']>;
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: { role: string; count: number }[];
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
}

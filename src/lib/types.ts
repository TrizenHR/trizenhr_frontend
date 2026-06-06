export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  HR = 'hr',
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee',
}

export interface PlatformNotificationPreferences {
  pollIntervalSec?: number;
  refreshOnTabFocus?: boolean;
  showUnreadBadge?: boolean;
}

export interface PlatformPreferences {
  notifications?: PlatformNotificationPreferences;
}

export interface User {
  _id: string;
  id: string;
  organizationId?: string;
  organization?: {
    _id: string;
    name: string;
    subscriptionPlan: string;
  };
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  department?: string;
  employeeId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** System Admin — persisted platform UI preferences */
  platformPreferences?: PlatformPreferences;
  /** Profile picture URL or base64 data URI */
  profilePicture?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

/** In-app notification row (server-driven, role-aware). */
export interface DashboardNotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationListPayload {
  items: DashboardNotificationItem[];
  unreadCount: number;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    organizationId?: string;
    organization?: {
      _id: string;
      name: string;
      subscriptionPlan: string;
    };
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
  password?: string;
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
  userId: string | User;
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

export enum RegularizationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface AttendanceRegularization {
  _id: string;
  organizationId: string;
  userId: string | User;
  date: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  requestedStatus: AttendanceStatus;
  reason: string;
  status: RegularizationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Attendance Policy Types
export enum PolicyDayType {
  FULL_DAY = 'FULL_DAY',
  HALF_DAY = 'HALF_DAY',
  WEEKLY_OFF = 'WEEKLY_OFF',
}

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum WeekDay {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN',
}

export interface DefaultFullDayRule {
  startTime: string;
  endTime: string;
  expectedHours: number;
  graceMinutes: number;
}

export interface WeekRule {
  day: WeekDay;
  dayType: PolicyDayType;
  useDefaultTiming: boolean;
  startTime?: string;
  endTime?: string;
  expectedHours?: number;
  graceMinutes?: number;
}

export interface AttendancePolicy {
  _id: string;
  policyName: string;
  defaultFullDayRule: DefaultFullDayRule;
  weekRules: WeekRule[];
  autoAbsentEnabled: boolean;
  allowRegularization: boolean;
  isDefault: boolean;
  status: PolicyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AttendancePolicySummary {
  dayType: PolicyDayType;
  startTime?: string;
  endTime?: string;
  expectedHours?: number;
  graceMinutes?: number;
  isWorkingDay: boolean;
  isWeeklyOff: boolean;
  isHoliday: boolean;
  hasLeave: boolean;
  attendanceStatus: string;
  policyId?: string;
  policyName?: string;
  weekRules?: WeekRule[];
  defaultFullDayRule?: DefaultFullDayRule;
}

export enum WeeklyOffPattern {
  MON_FRI = 'mon_fri',
  MON_SAT = 'mon_sat',
  SECOND_FOURTH_SAT = 'second_fourth_sat',
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
  date: string;
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
  defaultAttendancePolicyId?:
    | string
    | {
        _id: string;
        policyName: string;
        status?: PolicyStatus;
      };
  members: (string | User)[];
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  headOfDepartment?: string;
  defaultAttendancePolicyId?: string | null;
}

// Organization Types
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface MicrosoftAuthConfig {
  tenantId?: string;
  domain?: string;
  allowMicrosoftAuth: boolean;
  allowLocalAuth: boolean;
}

export interface Organization {
  _id: string;
  name: string;
  subdomain?: string;
  isActive: boolean;
  /** Present when the org was soft-deleted from the platform */
  deletedAt?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry?: string;
  settings: {
    workingHours: {
      startTime: string;
      endTime: string;
    };
    workingDays?: {
      weeklyOffPattern: WeeklyOffPattern;
    };
    leavePolicy: {
      sickLeave: number;
      casualLeave: number;
      vacationLeave: number;
    };
    timezone: string;
    fiscalYearStart: number;
  };
  microsoftAuth?: MicrosoftAuthConfig;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Billing Types
export enum BillingInvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export interface BillingInvoice {
  _id: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  plan: SubscriptionPlan;
  pricePerUserPerDay: number;
  averageBillableUsers: number;
  amount: number;
  currency: string;
  status: BillingInvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BillingOverview {
  organizationId: string;
  organizationName: string;
  subscriptionPlan: SubscriptionPlan | string;
  pricePerUserPerDay: number;
  billingCycle: string;
  currency: string;
  activeUsers: number;
  currentMonthEstimate: number;
  monthlyHistory: {
    month: string; // 'YYYY-MM'
    amount: number;
    status: BillingInvoiceStatus;
  }[];
}

export interface CreateOrganizationPayload {
  name: string;
  subdomain?: string;
  /** Sends company-admin invite from support@trizenhr.com (create only) */
  companyAdminEmail?: string;
  companyAdminName?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiry?: Date;
  settings?: Partial<Organization['settings']>;
  microsoftAuth?: MicrosoftAuthConfig;
  /** Set via update only — pause/resume tenant without deleting data */
  isActive?: boolean;
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: { role: string; count: number }[];
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
}

// Dashboard Stats (role-specific)
export interface DashboardStats {
  totalUsers?: number;
  totalDepartments?: number;
  teamSize?: number;
  pendingLeaveApprovals?: number;
  todayAttendance: {
    present: number;
    late: number;
    absent: number;
    onLeave: number;
    total: number;
  };
}

// Payroll Types
export enum PayrollRunStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PayrollRecordStatus {
  PENDING = 'pending',
  PAID = 'paid',
  ON_HOLD = 'on_hold',
}

export interface Allowance {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface Deduction {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface SalaryStructure {
  _id: string;
  organizationId: string;
  userId: string | User;
  baseSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  effectiveFrom: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRun {
  _id: string;
  organizationId: string;
  month: number;
  year: number;
  status: PayrollRunStatus;
  processedBy?: string | User;
  processedAt?: string;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRecord {
  _id: string;
  organizationId: string;
  payrollRunId: string;
  userId: string | User;
  month: number;
  year: number;
  workingDays: number;
  daysWorked: number;
  leaveDays: number;
  absentDays: number;
  baseSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollRecordStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalaryStructurePayload {
  userId: string;
  baseSalary: number;
  allowances?: Allowance[];
  deductions?: Deduction[];
  effectiveFrom: Date | string;
}

export interface UpdateSalaryStructurePayload {
  baseSalary?: number;
  allowances?: Allowance[];
  deductions?: Deduction[];
  effectiveFrom?: Date | string;
}

export enum DemoInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export interface DemoInvitationDefaults {
  inviteLinkTtlHours: number;
  demoAccessTtlDays: number;
}

export interface DemoInvitation {
  _id: string;
  companyName: string;
  email: string;
  role: UserRole;
  status: DemoInvitationStatus;
  inviteExpiresAt: string;
  demoAccessExpiresAt?: string;
  acceptedAt?: string;
  demoTenantId: string;
  demoTenantName?: string;
  demoTenantSubdomain?: string;
  userId?: string;
  inviteLinkTtlHours: number;
  demoAccessTtlDays: number;
  notes?: string;
  invitedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDemoInvitationPayload {
  email: string;
  role: UserRole;
  notes?: string;
  inviteLinkTtlHours?: number;
  demoAccessTtlDays?: number;
}

export interface ValidatedDemoInvite {
  email: string;
  role: string;
  companyName: string;
  organizationId: string;
  organizationName: string;
  subdomain?: string;
  inviteExpiresAt: string;
  demoAccessTtlDays: number;
}


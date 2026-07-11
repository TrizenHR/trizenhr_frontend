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
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  /** False until invitee completes the post-password profile step */
  profileComplete?: boolean;
  /** When true, mobile tracks location after check-in */
  fieldTrackingEnabled?: boolean;
  fieldTrackingIntervalMinutes?: number;
  attendancePolicy?: {
    _id: string;
    policyName: string;
  } | null;
  leavePolicy?: {
    _id: string;
    policyName: string;
  } | null;
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
    profileComplete?: boolean;
  };
}

export interface ValidatedOrgInvite {
  email: string;
  organizationId: string;
  role: string;
  firstName: string;
  lastName: string;
  status: 'pending_password' | 'profile_incomplete' | 'already_onboarded';
}

export interface CompleteProfilePayload {
  dateOfBirth: string;
  gender: string;
  phone: string;
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
  WEEKLY_OFF = 'weekly_off',
  HOLIDAY = 'holiday',
  NOT_JOINED = 'not_joined',
  PRESENT_WITH_LATE = 'present_with_late',
}

export enum LocationStatus {
  VERIFIED = 'verified',
  OUT_OF_RANGE = 'out_of_range',
  NOT_CAPTURED = 'not_captured',
  NOT_APPLICABLE = 'not_applicable',
  MANUAL_OVERRIDE = 'manual_override',
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
  photoUrl?: string;
  photoKey?: string;
  officeLocationId?: string;
  photoUrl?: string; // Stable API path for check-in photo
  hasCheckInPhoto?: boolean;
  checkInLat?: number;
  checkInLng?: number;
  checkInDistance?: number;
  checkOutLat?: number;
  checkOutLng?: number;
  checkOutDistance?: number;
  locationStatus: LocationStatus;
  checkOutLocationLabel?: string;
  fieldTrackingSessionId?: string;
  createdAt: string;
  updatedAt: string;

export type FieldTrackingStatus = 'active' | 'completed' | 'force_stopped';

export interface FieldLocationSnapshot {
  latitude: number;
  longitude: number;
  accuracy?: number;
  recordedAt: string;
  batteryLevel?: number;
}

export interface FieldTrackingUserRef {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  employeeId?: string;
  email?: string;
  department?: string;
}

export interface FieldTrackingLiveSession {
  sessionId: string;
  attendanceId?: string;
  userId: string;
  user?: FieldTrackingUserRef;
  status: FieldTrackingStatus;
  startedAt?: string;
  lastLocation?: FieldLocationSnapshot;
  pointCount?: number;
}

export interface FieldLocationPoint {
  _id?: string;
  sessionId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  recordedAt: string;
  receivedAt?: string;
  batteryLevel?: number;
}

export interface FieldTrackingDayPath {
  userId: string;
  date: string;
  points: FieldLocationPoint[];
  sessions?: FieldTrackingLiveSession[];
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

export enum RegularizationRequestType {
  MISSED_CHECK_IN = 'missed_check_in',
  MISSED_CHECK_OUT = 'missed_check_out',
  INCORRECT_TIMING = 'incorrect_timing',
  ATTENDANCE_CORRECTION = 'attendance_correction',
  LOCATION_OUT_OF_RANGE = 'location_out_of_range',
}

export interface AttendanceRegularization {
  _id: string;
  organizationId: string;
  userId: string | User;
  date: string;
  requestType: RegularizationRequestType;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  requestedStatus: AttendanceStatus;
  reason: string;
  status: RegularizationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  flaggedDistance?: number;
  flaggedLat?: number;
  flaggedLng?: number;
  isSystemGenerated?: boolean;
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

export enum GeofenceEnforcementMode {
  BLOCK = 'BLOCK',
  FLAG = 'FLAG',
  DISABLED = 'DISABLED',
}

export interface GeofenceConfig {
  enabled: boolean;
  officeLocationIds: string[];
  enforcementMode: GeofenceEnforcementMode;
}

export interface OfficeLocation {
  _id: string;
  organizationId: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
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

export interface PolicyShiftRef {
  _id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  expectedHours: number;
  graceMinutes: number;
  status: string;
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
  shiftId?: string | PolicyShiftRef;
  geofence?: GeofenceConfig;
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

// Leave architecture (configurable types, policies, workflows)
export enum LeaveTypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface LeaveTypeRecord {
  _id: string;
  organizationId?: string;
  name: string;
  code: string;
  description?: string;
  isPaid: boolean;
  requiresDocument: boolean;
  allowHalfDay: boolean;
  isOther: boolean;
  status: LeaveTypeStatus;
  createdAt?: string;
  updatedAt?: string;
}

export enum ApproverType {
  SUPERVISOR = 'SUPERVISOR',
  HR = 'HR',
  ADMIN = 'ADMIN',
}

export interface WorkflowStep {
  order: number;
  approverType: ApproverType;
}

export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface ApprovalWorkflow {
  _id: string;
  organizationId?: string;
  workflowName: string;
  module: 'LEAVE';
  steps: WorkflowStep[];
  isDefault: boolean;
  status: WorkflowStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveRule {
  leaveTypeId: string | LeaveTypeRecord;
  annualAllocation: number;
  allowNegativeBalance?: boolean;
  allowCarryForward?: boolean;
  maxCarryForward?: number;
}

export enum LeavePolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface LeavePolicyRecord {
  _id: string;
  organizationId?: string;
  policyName: string;
  workflowId: string | ApprovalWorkflow;
  leaveRules: LeaveRule[];
  status: LeavePolicyStatus;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum ShiftStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Shift {
  _id: string;
  organizationId?: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  expectedHours: number;
  breakMinutes?: number;
  graceMinutes: number;
  isNightShift: boolean;
  status: ShiftStatus;
  createdAt?: string;
  updatedAt?: string;
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface LeaveApprovalRecord {
  _id: string;
  leaveId: string;
  workflowStep: number;
  approverId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  action: 'APPROVED' | 'REJECTED';
  comments?: string;
  createdAt: string;
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
  leaveTypeId: string | LeaveTypeRecord;
  leavePolicyId?: string | LeavePolicyRecord;
  otherLeaveTypeName?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay?: boolean;
  reason: string;
  attachmentUrl?: string;
  workflowId?: string | ApprovalWorkflow;
  currentApprovalStep?: number;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalanceEntry {
  leaveTypeId: string | LeaveTypeRecord;
  allocated: number;
  used: number;
  remaining: number;
}

export interface LeaveBalance {
  _id: string;
  userId: string;
  year: number;
  balances: LeaveBalanceEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LeavePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeaveRequestPayload {
  leaveTypeId: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string;
  isHalfDay?: boolean;
  attachmentUrl?: string;
  otherLeaveTypeName?: string;
}

export interface LeaveFilters {
  status?: LeaveStatus | string;
  leaveTypeId?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface AdjustLeaveBalancePayload {
  employeeId: string;
  year: number;
  leaveTypeId: string;
  allocated: number;
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
  defaultLeavePolicyId?:
    | string
    | {
        _id: string;
        policyName: string;
        status?: string;
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
  defaultLeavePolicyId?: string | null;
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


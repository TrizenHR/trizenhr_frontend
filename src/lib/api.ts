import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  LoginResponse,
  CreateUserPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  User,
  Attendance,
  AttendanceStatus,
  AttendancePagination,
  AttendanceStats,
  AttendanceRegularization,
  AttendancePolicy,
  AttendancePolicySummary,
  LeaveRequestPayload,
  Leave,
  LeaveFilters,
  LeavePagination,
  LeaveBalance,
  LeaveTypeRecord,
  LeavePolicyRecord,
  ApprovalWorkflow,
  Shift,
  LeaveApprovalRecord,
  AdjustLeaveBalancePayload,
  Department,
  DepartmentFormData,
  Organization,
  CreateOrganizationPayload,
  OrganizationStats,
  Holiday,
  HolidayFormData,
  HolidayType,
  PlatformNotificationPreferences,
  NotificationListPayload,
  DashboardStats,
  SalaryStructure,
  CreateSalaryStructurePayload,
  UpdateSalaryStructurePayload,
  PayrollRun,
  PayrollRunStatus,
  PayrollRecord,
  BillingOverview,
  BillingInvoice,
  DemoInvitationDefaults,
  DemoInvitation,
  DemoInvitationStatus,
  CreateDemoInvitationPayload,
  ValidatedDemoInvite,
} from './types';

function resolveApiBaseUrl(): string {
  // In the browser we read the runtime env var injected by Next.js.
  // Falls back to localhost for local development.
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/api'
  );
}

/** Returns true when running on the platform's own domain (not a tenant sub-domain). */
function isPlatformHost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  // Treat localhost / 127.0.0.1 / the bare domain (no subdomain) as the platform host.
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || '';
  if (!platformDomain) {
    // Fallback: no subdomain means platform host
    return !hostname.includes('.') || hostname === 'localhost';
  }
  return hostname === platformDomain;
}

export const API_BASE_URL = resolveApiBaseUrl();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (typeof window !== 'undefined') {
  if (!API_BASE_URL) {
    console.error(
      '[trizenhr api] NEXT_PUBLIC_API_URL is not set. Add it to .env (local) or build args (production).'
    );
  } else if (process.env.NODE_ENV === 'production') {
    console.info('[trizenhr api] baseURL =', api.defaults.baseURL);
  }
}

// Request interceptor - attach JWT token and optional Super Admin org override
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const selectedOrgId = localStorage.getItem('selectedOrganizationId');
      const storedUser = localStorage.getItem('user');
      let userRole: string | undefined;

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userRole = parsed.role;
        } catch {
          // ignore parse errors
        }
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Inject organizationId override for Super Admin on the platform domain only.
      // For tenant subdomains, organization is derived from subdomain on the backend.
      if (selectedOrgId && userRole === 'super_admin' && isPlatformHost()) {
        config.params = { ...config.params, organizationId: selectedOrgId };
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only treat 401 as an authentication failure.
    // 403 means "authenticated but not allowed" and should NOT log the user out.
    if (error.response?.status === 401) {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  },

  // Microsoft OAuth: Get authorization URL
  getMicrosoftAuthUrl: async (state?: string): Promise<{ authUrl: string }> => {
    const response = await api.get<ApiResponse<{ authUrl: string }>>('/auth/microsoft/url', {
      params: { state },
    });
    return response.data.data!;
  },

  // Microsoft OAuth: Handle callback and get tokens
  handleMicrosoftCallback: async (code: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/microsoft/callback', {
      code,
    });
    return response.data.data!;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  updatePlatformPreferences: async (payload: {
    notifications: Partial<PlatformNotificationPreferences>;
  }): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>('/auth/me/platform-preferences', payload);
    return response.data.data!;
  },

  changePassword: async (data: ChangePasswordPayload): Promise<void> => {
    await api.post('/auth/change-password', data);
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (payload: any): Promise<void> => {
    await api.post('/auth/reset-password', payload);
  },

  acceptInvitation: async (payload: {
    token?: string;
    email?: string;
    organizationId?: string;
    password: string;
  }): Promise<void> => {
    await api.post('/auth/accept-invitation', payload);
  },

  validateDemoInvite: async (token: string): Promise<ValidatedDemoInvite> => {
    const response = await api.get<ApiResponse<ValidatedDemoInvite>>('/auth/demo-invite/validate', {
      params: { token },
    });
    return response.data.data!;
  },
};

// User API
export const userApi = {
  getAllUsers: async (filters?: {
    role?: string;
    department?: string;
    isActive?: boolean;
    search?: string;
    organizationId?: string;
  }): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users', {
      params: filters,
    });
    return response.data.data!;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },

  createUser: async (data: CreateUserPayload): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  resendInvitation: async (id: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/users/${id}/resend-invitation`);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserPayload): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data!;
  },

  updateUserRole: async (id: string, role: string): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return response.data.data!;
  },

  assignSupervisor: async (id: string, supervisorId: string): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/supervisor`, {
      supervisorId,
    });
    return response.data.data!;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getUsersByDepartment: async (department: string): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>(`/users/department/${department}`);
    return response.data.data!;
  },

  getTeamMembers: async (supervisorId: string): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>(`/users/team/${supervisorId}`);
    return response.data.data!;
  },

  getUserStats: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/users/stats');
    return response.data.data!;
  },

  getNextEmployeeId: async (
    organizationId?: string,
    role?: string,
    department?: string
  ): Promise<{ nextEmployeeId: string; existingSample: string[] }> => {
    const params: Record<string, string> = {};
    if (organizationId) params.organizationId = organizationId;
    if (role) params.role = role;
    if (department) params.department = department;
    const response = await api.get<
      ApiResponse<{ nextEmployeeId: string; existingSample: string[] }>
    >('/users/next-employee-id', {
      params: Object.keys(params).length ? params : undefined,
    });
    return response.data.data!;
  },
};

// Attendance API
export const attendanceApi = {
  /**
   * Mark check-in for current user
   */
  checkIn: async (photoData?: string): Promise<Attendance> => {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/check-in', {
      photoData,
    });
    return response.data.data!;
  },

  /**
   * Mark check-out for current user
   */
  checkOut: async (): Promise<Attendance> => {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/check-out');
    return response.data.data!;
  },

  /**
   * Get today's attendance status
   */
  getTodayStatus: async (): Promise<Attendance | null> => {
    const response = await api.get<ApiResponse<any>>('/attendance/today');
    const payload = response.data.data;
    if (!payload) return null;
    if (payload.record !== undefined) {
      return payload.record || null;
    }
    return payload as Attendance;
  },

  getMyPolicy: async (): Promise<AttendancePolicySummary> => {
    const response = await api.get<ApiResponse<AttendancePolicySummary>>('/attendance/my-policy');
    return response.data.data!;
  },

  getTodayAttendance: async (): Promise<Attendance | null> => {
    const response = await api.get<
      ApiResponse<{ record: Attendance | null; policy?: unknown } | Attendance | null>
    >('/attendance/today');
    const payload = response.data.data;
    if (!payload) return null;
    if (typeof payload === 'object' && payload !== null && 'record' in payload) {
      return payload.record ?? null;
    }
    return payload as Attendance;
  },

  /**
   * Get current user's attendance history
   */
  getMyAttendance: async (filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: AttendanceStatus;
    page?: number;
    limit?: number;
  }): Promise<{ records: Attendance[]; pagination: AttendancePagination }> => {
    const response = await api.get<
      ApiResponse<Attendance[]> & { pagination: AttendancePagination }
    >('/attendance/my-attendance', {
      params: {
        ...filters,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
      },
    });
    return {
      records: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get current user's attendance statistics
   */
  getMyStats: async (month?: number, year?: number): Promise<AttendanceStats> => {
    const response = await api.get<ApiResponse<AttendanceStats>>('/attendance/my-stats', {
      params: { month, year },
    });
    return response.data.data!;
  },

  /**
   * Get all attendance records (Admin/HR only)
   */
  getAllAttendance: async (filters?: {
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    status?: AttendanceStatus;
    department?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ records: Attendance[]; pagination: AttendancePagination }> => {
    const response = await api.get<
      ApiResponse<Attendance[]> & { pagination: AttendancePagination }
    >('/attendance/all', {
      params: {
        ...filters,
        date: filters?.date?.toISOString(),
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
      },
    });
    return {
      records: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get specific user's attendance (Admin/HR/Supervisor)
   */
  getUserAttendance: async (
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ): Promise<{ records: Attendance[]; pagination: AttendancePagination }> => {
    const response = await api.get<
      ApiResponse<Attendance[]> & { pagination: AttendancePagination }
    >(`/attendance/user/${userId}`, {
      params: {
        ...filters,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
      },
    });
    return {
      records: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  createRegularization: async (data: {
    date: string;
    requestType: string;
    requestedCheckIn?: string;
    requestedCheckOut?: string;
    requestedStatus: AttendanceStatus;
    reason: string;
  }): Promise<AttendanceRegularization> => {
    const response = await api.post<ApiResponse<AttendanceRegularization>>(
      '/attendance/regularization',
      data
    );
    return response.data.data!;
  },

  getMyRegularizations: async (filters?: {
    page?: number;
    limit?: number;
  }): Promise<{ records: AttendanceRegularization[]; pagination: AttendancePagination }> => {
    const response = await api.get<
      ApiResponse<AttendanceRegularization[]> & { pagination: AttendancePagination }
    >('/attendance/regularization/my', { params: filters });
    return {
      records: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  getPendingRegularizations: async (filters?: {
    page?: number;
    limit?: number;
  }): Promise<{ records: AttendanceRegularization[]; pagination: AttendancePagination }> => {
    const response = await api.get<
      ApiResponse<AttendanceRegularization[]> & { pagination: AttendancePagination }
    >('/attendance/regularization/pending', { params: filters });
    return {
      records: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  approveRegularization: async (id: string, notes?: string): Promise<AttendanceRegularization> => {
    const response = await api.patch<ApiResponse<AttendanceRegularization>>(
      `/attendance/regularization/${id}/approve`,
      { notes }
    );
    return response.data.data!;
  },

  rejectRegularization: async (id: string, notes: string): Promise<AttendanceRegularization> => {
    const response = await api.patch<ApiResponse<AttendanceRegularization>>(
      `/attendance/regularization/${id}/reject`,
      { notes }
    );
    return response.data.data!;
  },

  markAutoAbsent: async (date?: string): Promise<{ marked: number; skipped: number }> => {
    const response = await api.post<ApiResponse<{ marked: number; skipped: number }>>(
      '/attendance/mark-absent',
      { date }
    );
    return response.data.data!;
  },
};

// Attendance Policies API
export const attendancePolicyApi = {
  getAll: async (status?: string): Promise<AttendancePolicy[]> => {
    const response = await api.get<ApiResponse<AttendancePolicy[]>>('/attendance-policies', {
      params: status ? { status } : undefined,
    });
    return response.data.data!;
  },

  getById: async (id: string): Promise<AttendancePolicy> => {
    const response = await api.get<ApiResponse<AttendancePolicy>>(
      `/attendance-policies/${id}`
    );
    return response.data.data!;
  },

  create: async (data: Partial<AttendancePolicy>): Promise<AttendancePolicy> => {
    const response = await api.post<ApiResponse<AttendancePolicy>>(
      '/attendance-policies',
      data
    );
    return response.data.data!;
  },

  update: async (id: string, data: Partial<AttendancePolicy>): Promise<AttendancePolicy> => {
    const response = await api.put<ApiResponse<AttendancePolicy>>(
      `/attendance-policies/${id}`,
      data
    );
    return response.data.data!;
  },

  updateStatus: async (id: string, status: string): Promise<AttendancePolicy> => {
    const response = await api.patch<ApiResponse<AttendancePolicy>>(
      `/attendance-policies/${id}/status`,
      { status }
    );
    return response.data.data!;
  },

  setDefault: async (id: string): Promise<AttendancePolicy> => {
    const response = await api.patch<ApiResponse<AttendancePolicy>>(
      `/attendance-policies/${id}/default`
    );
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/attendance-policies/${id}`);
  },
};

// Leave API
export const leaveApi = {
  /**
   * Request new leave
   */
  requestLeave: async (
    data: LeaveRequestPayload
  ): Promise<Leave> => {
    const response = await api.post<ApiResponse<Leave>>('/leaves/request', data);
    return response.data.data!;
  },

  /**
   * Get current user's leaves
   */
  getMyLeaves: async (filters?: LeaveFilters): Promise<{
    records: Leave[];
    pagination: LeavePagination;
  }> => {
    const response = await api.get<
      ApiResponse<Leave[]> & { pagination: LeavePagination }
    >('/leaves/my-leaves', {
      params: {
        ...filters,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
      },
    });
    return {
      records: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get current user's leave balance
   */
  getMyBalance: async (year?: number): Promise<LeaveBalance> => {
    const response = await api.get<ApiResponse<LeaveBalance>>('/leaves/my-balance', {
      params: { year },
    });
    return response.data.data!;
  },

  /**
   * Get pending leaves (Supervisor/HR/Admin)
   */
  getPendingLeaves: async (page?: number, limit?: number): Promise<{
    records: Leave[];
    pagination: LeavePagination;
  }> => {
    const response = await api.get<
      ApiResponse<Leave[]> & { pagination: LeavePagination }
    >('/leaves/pending', {
      params: { page, limit },
    });
    return {
      records: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get all leaves with filters (HR/Admin)
   */
  getAllLeaves: async (filters?: LeaveFilters): Promise<{
    records: Leave[];
    pagination: LeavePagination;
  }> => {
    const response = await api.get<
      ApiResponse<Leave[]> & { pagination: LeavePagination }
    >('/leaves/all', {
      params: {
        ...filters,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
      },
    });
    return {
      records: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get team leaves with filters (Supervisor gets only their team; HR/Admin gets all)
   */
  getTeamLeaves: async (filters?: LeaveFilters): Promise<{
    records: Leave[];
    pagination: LeavePagination;
  }> => {
    const response = await api.get<
      ApiResponse<Leave[]> & { pagination: LeavePagination }
    >('/leaves/team', {
      params: {
        ...filters,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
      },
    });
    return {
      records: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get leaves for calendar view
   */
  getCalendarLeaves: async (
    month: number,
    year: number,
    filterUserId?: string
  ): Promise<Leave[]> => {
    const response = await api.get<ApiResponse<Leave[]>>('/leaves/calendar', {
      params: { month, year, filterUserId },
    });
    return response.data.data!;
  },

  /**
   * Approve leave
   */
  approveLeave: async (id: string, notes?: string): Promise<Leave> => {
    const response = await api.patch<ApiResponse<Leave>>(
      `/leaves/${id}/approve`,
      { notes }
    );
    return response.data.data!;
  },

  /**
   * Reject leave
   */
  rejectLeave: async (id: string, notes: string): Promise<Leave> => {
    const response = await api.patch<ApiResponse<Leave>>(
      `/leaves/${id}/reject`,
      { notes }
    );
    return response.data.data!;
  },

  /**
   * Cancel leave (by employee)
   */
  cancelLeave: async (id: string): Promise<Leave> => {
    const response = await api.patch<ApiResponse<Leave>>(
      `/leaves/${id}/cancel`
    );
    return response.data.data!;
  },

  getLeaveApprovals: async (leaveId: string): Promise<LeaveApprovalRecord[]> => {
    const response = await api.get<ApiResponse<LeaveApprovalRecord[]>>(
      `/leaves/${leaveId}/approvals`
    );
    return response.data.data!;
  },

  adjustBalance: async (data: AdjustLeaveBalancePayload): Promise<LeaveBalance> => {
    const response = await api.patch<ApiResponse<LeaveBalance>>(
      '/leaves/balances/adjust',
      data
    );
    return response.data.data!;
  },
};

export const leaveTypeApi = {
  getAll: async (activeOnly = false): Promise<LeaveTypeRecord[]> => {
    const response = await api.get<ApiResponse<LeaveTypeRecord[]>>('/leave-types', {
      params: activeOnly ? { activeOnly: 'true' } : undefined,
    });
    return response.data.data!;
  },

  getById: async (id: string): Promise<LeaveTypeRecord> => {
    const response = await api.get<ApiResponse<LeaveTypeRecord>>(`/leave-types/${id}`);
    return response.data.data!;
  },

  create: async (data: Partial<LeaveTypeRecord>): Promise<LeaveTypeRecord> => {
    const response = await api.post<ApiResponse<LeaveTypeRecord>>('/leave-types', data);
    return response.data.data!;
  },

  update: async (id: string, data: Partial<LeaveTypeRecord>): Promise<LeaveTypeRecord> => {
    const response = await api.put<ApiResponse<LeaveTypeRecord>>(`/leave-types/${id}`, data);
    return response.data.data!;
  },

  updateStatus: async (id: string, status: string): Promise<LeaveTypeRecord> => {
    const response = await api.patch<ApiResponse<LeaveTypeRecord>>(
      `/leave-types/${id}/status`,
      { status }
    );
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/leave-types/${id}`);
  },
};

export const leavePolicyApi = {
  getAll: async (): Promise<LeavePolicyRecord[]> => {
    const response = await api.get<ApiResponse<LeavePolicyRecord[]>>('/leave-policies');
    return response.data.data!;
  },

  getById: async (id: string): Promise<LeavePolicyRecord> => {
    const response = await api.get<ApiResponse<LeavePolicyRecord>>(`/leave-policies/${id}`);
    return response.data.data!;
  },

  create: async (data: {
    policyName: string;
    workflowId: string;
    leaveRules: Array<{
      leaveTypeId: string;
      annualAllocation: number;
      allowNegativeBalance?: boolean;
      allowCarryForward?: boolean;
      maxCarryForward?: number;
    }>;
    isDefault?: boolean;
    status?: string;
  }): Promise<LeavePolicyRecord> => {
    const response = await api.post<ApiResponse<LeavePolicyRecord>>('/leave-policies', data);
    return response.data.data!;
  },

  update: async (
    id: string,
    data: Partial<{
      policyName: string;
      workflowId: string;
      leaveRules: Array<{
        leaveTypeId: string;
        annualAllocation: number;
        allowNegativeBalance?: boolean;
        allowCarryForward?: boolean;
        maxCarryForward?: number;
      }>;
      isDefault?: boolean;
      status?: string;
    }>
  ): Promise<LeavePolicyRecord> => {
    const response = await api.put<ApiResponse<LeavePolicyRecord>>(`/leave-policies/${id}`, data);
    return response.data.data!;
  },

  setDefault: async (id: string): Promise<LeavePolicyRecord> => {
    const response = await api.patch<ApiResponse<LeavePolicyRecord>>(
      `/leave-policies/${id}/default`
    );
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/leave-policies/${id}`);
  },
};

export const approvalWorkflowApi = {
  getAll: async (): Promise<ApprovalWorkflow[]> => {
    const response = await api.get<ApiResponse<ApprovalWorkflow[]>>('/approval-workflows');
    return response.data.data!;
  },

  getById: async (id: string): Promise<ApprovalWorkflow> => {
    const response = await api.get<ApiResponse<ApprovalWorkflow>>(`/approval-workflows/${id}`);
    return response.data.data!;
  },

  create: async (data: {
    workflowName: string;
    steps: Array<{ order: number; approverType: string }>;
    isDefault?: boolean;
    status?: string;
  }): Promise<ApprovalWorkflow> => {
    const response = await api.post<ApiResponse<ApprovalWorkflow>>('/approval-workflows', data);
    return response.data.data!;
  },

  update: async (
    id: string,
    data: Partial<{
      workflowName: string;
      steps: Array<{ order: number; approverType: string }>;
      isDefault?: boolean;
      status?: string;
    }>
  ): Promise<ApprovalWorkflow> => {
    const response = await api.put<ApiResponse<ApprovalWorkflow>>(`/approval-workflows/${id}`, data);
    return response.data.data!;
  },

  setDefault: async (id: string): Promise<ApprovalWorkflow> => {
    const response = await api.patch<ApiResponse<ApprovalWorkflow>>(
      `/approval-workflows/${id}/default`
    );
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/approval-workflows/${id}`);
  },
};

export const shiftApi = {
  getAll: async (status?: string): Promise<Shift[]> => {
    const response = await api.get<ApiResponse<Shift[]>>('/shifts', {
      params: status ? { status } : undefined,
    });
    return response.data.data!;
  },

  getById: async (id: string): Promise<Shift> => {
    const response = await api.get<ApiResponse<Shift>>(`/shifts/${id}`);
    return response.data.data!;
  },

  create: async (data: Partial<Shift>): Promise<Shift> => {
    const response = await api.post<ApiResponse<Shift>>('/shifts', data);
    return response.data.data!;
  },

  update: async (id: string, data: Partial<Shift>): Promise<Shift> => {
    const response = await api.put<ApiResponse<Shift>>(`/shifts/${id}`, data);
    return response.data.data!;
  },

  updateStatus: async (id: string, status: string): Promise<Shift> => {
    const response = await api.patch<ApiResponse<Shift>>(`/shifts/${id}/status`, { status });
    return response.data.data!;
  },
};

// Holiday API
export const holidayApi = {
  create: async (data: HolidayFormData): Promise<Holiday> => {
    const response = await api.post<ApiResponse<Holiday>>('/holidays', data);
    return response.data.data!;
  },

  getAll: async (filters?: { year?: number; type?: HolidayType }): Promise<Holiday[]> => {
    const response = await api.get<ApiResponse<Holiday[]>>('/holidays', {
      params: filters,
    });
    return response.data.data!;
  },

  getById: async (id: string): Promise<Holiday> => {
    const response = await api.get<ApiResponse<Holiday>>(`/holidays/${id}`);
    return response.data.data!;
  },

  update: async (id: string, data: Partial<HolidayFormData>): Promise<Holiday> => {
    const response = await api.put<ApiResponse<Holiday>>(`/holidays/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/holidays/${id}`);
  },

  checkDate: async (date: Date): Promise<{ isHoliday: boolean; holiday: Holiday | null }> => {
    const response = await api.get<ApiResponse<{ isHoliday: boolean; holiday: Holiday | null }>>(
      `/holidays/check/${date.toISOString().split('T')[0]}`
    );
    return response.data.data!;
  },

  getUpcoming: async (limit?: number): Promise<Holiday[]> => {
    const response = await api.get<ApiResponse<Holiday[]>>('/holidays/upcoming', {
      params: { limit },
    });
    return response.data.data!;
  },

  bulkCreate: async (holidays: Array<{
    name: string;
    date: string;
    type: HolidayType;
    description?: string;
    isRecurring?: boolean;
  }>): Promise<{
    created: Holiday[];
    errors: Array<{ row: number; error: string }>;
    summary: { total: number; successful: number; failed: number };
  }> => {
    const response = await api.post<ApiResponse<{
      created: Holiday[];
      errors: Array<{ row: number; error: string }>;
      summary: { total: number; successful: number; failed: number };
    }>>('/holidays/bulk', { holidays });
    return response.data.data!;
  },
};

export const departmentApi = {
  getAll: async (organizationId?: string): Promise<Department[]> => {
    const response = await api.get<ApiResponse<Department[]>>('/departments', {
      params: organizationId ? { organizationId } : undefined,
    });
    return response.data.data!;
  },

  getById: async (id: string): Promise<Department> => {
    const response = await api.get<ApiResponse<Department>>(`/departments/${id}`);
    return response.data.data!;
  },

  create: async (data: DepartmentFormData): Promise<Department> => {
    const response = await api.post<ApiResponse<Department>>('/departments', data);
    return response.data.data!;
  },

  update: async (id: string, data: Partial<DepartmentFormData>): Promise<Department> => {
    const response = await api.put<ApiResponse<Department>>(`/departments/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  addMember: async (deptId: string, userId: string): Promise<Department> => {
    const response = await api.post<ApiResponse<Department>>(
      `/departments/${deptId}/members`,
      { userId }
    );
    return response.data.data!;
  },

  removeMember: async (deptId: string, userId: string): Promise<Department> => {
    const response = await api.delete<ApiResponse<Department>>(
      `/departments/${deptId}/members/${userId}`
    );
    return response.data.data!;
  },
};

// Organization API (Super Admin only)
export const organizationApi = {
  getAll: async (): Promise<Organization[]> => {
    const response = await api.get<ApiResponse<Organization[]>>('/organizations');
    return response.data.data!;
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await api.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return response.data.data!;
  },

  create: async (data: CreateOrganizationPayload): Promise<Organization> => {
    const response = await api.post<ApiResponse<Organization>>('/organizations', data);
    return response.data.data!;
  },

  update: async (id: string, data: Partial<CreateOrganizationPayload>): Promise<Organization> => {
    const response = await api.put<ApiResponse<Organization>>(`/organizations/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/organizations/${id}`);
  },

  getStats: async (id: string): Promise<OrganizationStats> => {
    const response = await api.get<ApiResponse<OrganizationStats>>(`/organizations/${id}/stats`);
    return response.data.data!;
  },

  // Get current user's organization settings (Admin/HR)
  getMySettings: async (): Promise<Organization['settings']> => {
    const response = await api.get<ApiResponse<Organization['settings']>>('/organizations/my/settings');
    return response.data.data!;
  },

  // Update current user's organization settings (Admin/HR)
  updateMySettings: async (settings: Partial<Organization['settings']>): Promise<Organization> => {
    const response = await api.put<ApiResponse<Organization>>('/organizations/my/settings', {
      settings,
    });
    return response.data.data!;
  },
};

// Platform API (Super Admin only)
export const platformApi = {
  getDemoInvitationDefaults: async (): Promise<DemoInvitationDefaults> => {
    const response = await api.get<ApiResponse<DemoInvitationDefaults>>(
      '/platform/settings/demo-invitations'
    );
    return response.data.data!;
  },

  updateDemoInvitationDefaults: async (
    payload: Partial<DemoInvitationDefaults>
  ): Promise<DemoInvitationDefaults> => {
    const response = await api.patch<ApiResponse<DemoInvitationDefaults>>(
      '/platform/settings/demo-invitations',
      payload
    );
    return response.data.data!;
  },

  listDemoInvites: async (params?: {
    status?: DemoInvitationStatus;
    email?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: DemoInvitation[]; meta: ApiResponse['meta'] }> => {
    const response = await api.get<ApiResponse<DemoInvitation[]>>('/platform/demo-invites', {
      params,
    });
    return { items: response.data.data ?? [], meta: response.data.meta };
  },

  createDemoInvite: async (payload: CreateDemoInvitationPayload): Promise<DemoInvitation> => {
    const response = await api.post<ApiResponse<DemoInvitation>>('/platform/demo-invites', payload);
    return response.data.data!;
  },

  revokeDemoInvite: async (id: string): Promise<DemoInvitation> => {
    const response = await api.post<ApiResponse<DemoInvitation>>(
      `/platform/demo-invites/${id}/revoke`
    );
    return response.data.data!;
  },

  suspendDemoInvite: async (id: string): Promise<DemoInvitation> => {
    const response = await api.post<ApiResponse<DemoInvitation>>(
      `/platform/demo-invites/${id}/suspend`
    );
    return response.data.data!;
  },

  restoreDemoInvite: async (id: string): Promise<DemoInvitation> => {
    const response = await api.post<ApiResponse<DemoInvitation>>(
      `/platform/demo-invites/${id}/restore`
    );
    return response.data.data!;
  },

  resendDemoInvite: async (id: string): Promise<DemoInvitation> => {
    const response = await api.post<ApiResponse<DemoInvitation>>(
      `/platform/demo-invites/${id}/resend`
    );
    return response.data.data!;
  },
};

// Notifications (role-aware, server aggregated)
export const notificationsApi = {
  getList: async (): Promise<NotificationListPayload> => {
    const response = await api.get<ApiResponse<NotificationListPayload>>('/notifications');
    return response.data.data!;
  },

  markRead: async (keys: string[]): Promise<NotificationListPayload> => {
    const response = await api.post<ApiResponse<NotificationListPayload>>('/notifications/mark-read', {
      keys,
    });
    return response.data.data!;
  },

  markAllRead: async (): Promise<NotificationListPayload> => {
    const response = await api.post<ApiResponse<NotificationListPayload>>('/notifications/mark-all-read');
    return response.data.data!;
  },
};

// Dashboard API (Admin/HR/Supervisor)
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data!;
  },
};

// Payroll API
export const payrollApi = {
  // Salary Structure Management
  createSalaryStructure: async (data: CreateSalaryStructurePayload): Promise<SalaryStructure> => {
    const response = await api.post<ApiResponse<SalaryStructure>>('/payroll/salary-structure', data);
    return response.data.data!;
  },

  updateSalaryStructure: async (
    userId: string,
    data: UpdateSalaryStructurePayload
  ): Promise<SalaryStructure> => {
    const response = await api.put<ApiResponse<SalaryStructure>>(
      `/payroll/salary-structure/${userId}`,
      data
    );
    return response.data.data!;
  },

  getSalaryStructure: async (userId: string): Promise<SalaryStructure | null> => {
    const response = await api.get<ApiResponse<SalaryStructure | null>>(
      `/payroll/salary-structure/${userId}`
    );
    return response.data.data!;
  },

  getAllSalaryStructures: async (filters?: {
    department?: string;
    search?: string;
  }): Promise<SalaryStructure[]> => {
    const response = await api.get<ApiResponse<SalaryStructure[]>>('/payroll/salary-structures', {
      params: filters,
    });
    return response.data.data!;
  },

  // Payroll Runs
  createPayrollRun: async (month: number, year: number): Promise<PayrollRun> => {
    const response = await api.post<ApiResponse<PayrollRun>>('/payroll/run', { month, year });
    return response.data.data!;
  },

  processPayrollRun: async (runId: string): Promise<PayrollRun> => {
    const response = await api.post<ApiResponse<PayrollRun>>(`/payroll/run/${runId}/process`);
    return response.data.data!;
  },

  getPayrollRun: async (
    runId: string
  ): Promise<PayrollRun & { records: PayrollRecord[] }> => {
    const response = await api.get<ApiResponse<PayrollRun & { records: PayrollRecord[] }>>(
      `/payroll/run/${runId}`
    );
    return response.data.data!;
  },

  getPayrollRuns: async (filters?: {
    year?: number;
    status?: PayrollRunStatus;
  }): Promise<PayrollRun[]> => {
    const response = await api.get<ApiResponse<PayrollRun[]>>('/payroll/runs', {
      params: filters,
    });
    return response.data.data!;
  },

  // Employee Payslips (My Salary)
  getMyPayslips: async (year?: number): Promise<PayrollRecord[]> => {
    const response = await api.get<ApiResponse<PayrollRecord[]>>('/payroll/my-payslips', {
      params: { year },
    });
    return response.data.data!;
  },

  // Payroll Record Details
  getPayrollRecord: async (recordId: string): Promise<PayrollRecord> => {
    const response = await api.get<ApiResponse<PayrollRecord>>(`/payroll/records/${recordId}`);
    return response.data.data!;
  },
};

// Billing API
export const billingApi = {
  /**
   * Get billing overview for the current organization (Company Admin / Super Admin)
   */
  getOverview: async (): Promise<BillingOverview> => {
    const response = await api.get<ApiResponse<BillingOverview>>('/billing/overview');
    return response.data.data!;
  },

  /**
   * Get billing invoices for the current organization
   */
  getInvoices: async (): Promise<BillingInvoice[]> => {
    const response = await api.get<ApiResponse<BillingInvoice[]>>('/billing/invoices');
    return response.data.data || [];
  },
};

export default api;

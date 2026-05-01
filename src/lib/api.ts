import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  LoginResponse,
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  Attendance,
  AttendanceStatus,
  AttendanceStats,
  AttendancePagination,
  Leave,
  LeaveBalance,
  LeaveRequestPayload,
  LeaveFilters,
  LeavePagination,
  Holiday,
  HolidayFormData,
  HolidayType,
  Department,
  DepartmentFormData,
  Organization,
  CreateOrganizationPayload,
  OrganizationStats,
  DashboardStats,
  SalaryStructure,
  PayrollRun,
  PayrollRunStatus,
  PayrollRecord,
  CreateSalaryStructurePayload,
  UpdateSalaryStructurePayload,
} from './types';

const DEFAULT_DEV_API_URL = 'http://localhost:5000/api';
const DEFAULT_PROD_API_URL = 'https://trizen-attendease-backend.llp.trizenventures.com/api';

function normalizeApiUrl(value?: string): string {
  const raw = (value || '').trim().replace(/^['"]|['"]$/g, '');
  if (!raw) return '';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function resolveApiBaseUrl(): string {
  const fromEnv = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
  if (fromEnv) return fromEnv;

  if (typeof window === 'undefined') {
    // During SSR/build, keep deterministic default.
    return process.env.NODE_ENV === 'production' ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL;
  }

  // In browser production, never fall back to relative/same-origin API for auth calls.
  return process.env.NODE_ENV === 'production' ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Visible in browser devtools to verify deployed bundle API target.
  console.info('[trizenhr api] baseURL =', api.defaults.baseURL);
}

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const selectedOrgId = localStorage.getItem('selectedOrganizationId');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Inject organizationId override for Super Admin
      if (selectedOrgId) {
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
    if (error.response?.status === 401 || error.response?.status === 403) {
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

  changePassword: async (data: ChangePasswordPayload): Promise<void> => {
    await api.post('/auth/change-password', data);
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// User API
export const userApi = {
  getAllUsers: async (filters?: {
    role?: string;
    department?: string;
    isActive?: boolean;
    search?: string;
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

  createUser: async (data: CreateUserPayload): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data!;
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
    const response = await api.get<ApiResponse<Attendance>>('/attendance/today');
    return response.data.data || null;
  },

  /**
   * Get current user's attendance history
   */
  getMyAttendance: async (filters?: {
    startDate?: Date;
    endDate?: Date;
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
    const response = await api.get<ApiResponse<{ isHoliday: boolean; holiday: Holiday |  null }>>(
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
  getAll: async (): Promise<Department[]> => {
    const response = await api.get<ApiResponse<Department[]>>('/departments');
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

export default api;

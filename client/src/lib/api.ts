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
} from './types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
    const response = await api.post<ApiResponse<Leave>>('/leave/request', data);
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
    >('/leave/my-leaves', {
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
    const response = await api.get<ApiResponse<LeaveBalance>>('/leave/my-balance', {
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
    >('/leave/pending', {
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
    >('/leave/all', {
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
    const response = await api.get<ApiResponse<Leave[]>>('/leave/calendar', {
      params: { month, year, filterUserId },
    });
    return response.data.data!;
  },

  /**
   * Approve leave
   */
  approveLeave: async (id: string, notes?: string): Promise<Leave> => {
    const response = await api.patch<ApiResponse<Leave>>(
      `/leave/${id}/approve`,
      { notes }
    );
    return response.data.data!;
  },

  /**
   * Reject leave
   */
  rejectLeave: async (id: string, notes: string): Promise<Leave> => {
    const response = await api.patch<ApiResponse<Leave>>(
      `/leave/${id}/reject`,
      { notes }
    );
    return response.data.data!;
  },

  /**
   * Cancel leave (by employee)
   */
  cancelLeave: async (id: string): Promise<Leave> => {
    const response = await api.patch<ApiResponse<Leave>>(
      `/leave/${id}/cancel`
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
};

export default api;

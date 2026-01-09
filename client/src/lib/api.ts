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

export default api;

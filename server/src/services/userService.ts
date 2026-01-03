import User, { IUser, UserRole } from '../models/User';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../utils/AppError';
import mongoose from 'mongoose';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  supervisorId?: string;
  employeeId?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  department?: string;
  supervisorId?: string;
  employeeId?: string;
}

export interface UserFilters {
  role?: UserRole;
  department?: string;
  isActive?: boolean;
  search?: string;
}

class UserService {
  /**
   * Create a new user (Super Admin/Admin/HR only)
   */
  async createUser(userData: CreateUserData, createdByUserId: string): Promise<IUser> {
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    // Check if employeeId already exists (if provided)
    if (userData.employeeId) {
      const existingEmployee = await User.findOne({ employeeId: userData.employeeId });
      if (existingEmployee) {
        throw new ConflictError('Employee ID already in use');
      }
    }

    // Validate supervisor if provided
    if (userData.supervisorId) {
      const supervisor = await User.findById(userData.supervisorId);
      if (!supervisor) {
        throw new NotFoundError('Supervisor not found');
      }
      if (supervisor.role !== UserRole.SUPERVISOR && supervisor.role !== UserRole.ADMIN) {
        throw new BadRequestError('Assigned supervisor must have supervisor or admin role');
      }
    }

    // Create user
    const user = new User({
      ...userData,
      createdBy: createdByUserId,
    });

    await user.save();

    return user;
  }

  /**
   * Get all users with optional filters (role-based access)
   */
  async getAllUsers(filters?: UserFilters): Promise<IUser[]> {
    const query: any = {};

    // Apply filters
    if (filters?.role) {
      query.role = filters.role;
    }

    if (filters?.department) {
      query.department = filters.department;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Search by name or email
    if (filters?.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { employeeId: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('supervisorId', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return users;
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(department: string): Promise<IUser[]> {
    const users = await User.find({ department, isActive: true })
      .populate('supervisorId', 'firstName lastName email')
      .sort({ firstName: 1 });

    return users;
  }

  /**
   * Get team members for a supervisor
   */
  async getTeamMembers(supervisorId: string): Promise<IUser[]> {
    const users = await User.find({ supervisorId, isActive: true })
      .populate('supervisorId', 'firstName lastName email')
      .sort({ firstName: 1 });

    return users;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid user ID');
    }

    const user = await User.findById(userId)
      .populate('supervisorId', 'firstName lastName email role department')
      .populate('createdBy', 'firstName lastName email');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update user role (Super Admin/Admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent changing super admin role (extra safety)
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenError('Cannot change super admin role');
    }

    user.role = newRole;
    await user.save();

    return user;
  }

  /**
   * Assign supervisor to user
   */
  async assignSupervisor(userId: string, supervisorId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const supervisor = await User.findById(supervisorId);
    if (!supervisor) {
      throw new NotFoundError('Supervisor not found');
    }

    if (supervisor.role !== UserRole.SUPERVISOR && supervisor.role !== UserRole.ADMIN) {
      throw new BadRequestError('Assigned user must have supervisor or admin role');
    }

    user.supervisorId = new mongoose.Types.ObjectId(supervisorId);
    await user.save();

    return user;
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updates: UpdateUserData): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if employeeId is being changed and if it's already in use
    if (updates.employeeId && updates.employeeId !== user.employeeId) {
      const existing = await User.findOne({ employeeId: updates.employeeId });
      if (existing) {
        throw new ConflictError('Employee ID already in use');
      }
    }

    // Validate supervisor if being updated
    if (updates.supervisorId) {
      const supervisor = await User.findById(updates.supervisorId);
      if (!supervisor) {
        throw new NotFoundError('Supervisor not found');
      }
      if (supervisor.role !== UserRole.SUPERVISOR && supervisor.role !== UserRole.ADMIN) {
        throw new BadRequestError('Assigned supervisor must have supervisor or admin role');
      }
    }

    // Update fields
    Object.assign(user, updates);
    await user.save();

    return user;
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent deleting super admin
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenError('Cannot delete super admin');
    }

    user.isActive = false;
    await user.save();
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<any> {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalUsers = await User.countDocuments({ isActive: true });
    const totalInactive = await User.countDocuments({ isActive: false });

    return {
      totalUsers,
      totalInactive,
      byRole: stats,
    };
  }
}

export default new UserService();

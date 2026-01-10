import Department, { IDepartment } from '../models/Department';
import mongoose from 'mongoose';

export class DepartmentService {
  /**
   * Create a new department
   */
  async createDepartment(
    name: string,
    description?: string,
    headOfDepartment?: string
  ): Promise<IDepartment> {
    const department = await Department.create({
      name,
      description,
      headOfDepartment: headOfDepartment ? new mongoose.Types.ObjectId(headOfDepartment) : undefined,
      members: [],
    });

    return department;
  }

  /**
   * Get all departments
   */
  async getAllDepartments(): Promise<IDepartment[]> {
    const departments = await Department.find()
      .populate('headOfDepartment', 'firstName lastName email')
      .populate('members', 'firstName lastName email employeeId')
      .sort({ name: 1 })
      .lean();

    return departments;
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: string): Promise<IDepartment | null> {
    const department = await Department.findById(id)
      .populate('headOfDepartment', 'firstName lastName email')
      .populate('members', 'firstName lastName email employeeId')
      .lean();

    return department;
  }

  /**
   * Update department
   */
  async updateDepartment(
    id: string,
    updates: {
      name?: string;
      description?: string;
      headOfDepartment?: string;
    }
  ): Promise<IDepartment | null> {
    const updateData: any = { ...updates };
    
    if (updates.headOfDepartment) {
      updateData.headOfDepartment = new mongoose.Types.ObjectId(updates.headOfDepartment);
    }

    const department = await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('headOfDepartment', 'firstName lastName email')
      .populate('members', 'firstName lastName email employeeId');

    return department;
  }

  /**
   * Delete department
   */
  async deleteDepartment(id: string): Promise<boolean> {
    const result = await Department.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Add member to department
   */
  async addMemberToDepartment(deptId: string, userId: string): Promise<IDepartment | null> {
    const department = await Department.findByIdAndUpdate(
      deptId,
      { $addToSet: { members: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    )
      .populate('headOfDepartment', 'firstName lastName email')
      .populate('members', 'firstName lastName email employeeId');

    return department;
  }

  /**
   * Remove member from department
   */
  async removeMemberFromDepartment(deptId: string, userId: string): Promise<IDepartment | null> {
    const department = await Department.findByIdAndUpdate(
      deptId,
      { $pull: { members: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    )
      .populate('headOfDepartment', 'firstName lastName email')
      .populate('members', 'firstName lastName email employeeId');

    return department;
  }

  /**
   * Set department head
   */
  async setDepartmentHead(deptId: string, userId: string | null): Promise<IDepartment | null> {
    const department = await Department.findByIdAndUpdate(
      deptId,
      { headOfDepartment: userId ? new mongoose.Types.ObjectId(userId) : null },
      { new: true }
    )
      .populate('headOfDepartment', 'firstName lastName email')
      .populate('members', 'firstName lastName email employeeId');

    return department;
  }
}

export const departmentService = new DepartmentService();

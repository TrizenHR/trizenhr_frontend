'use client';

import { useEffect, useState } from 'react';
import { departmentApi, userApi } from '@/lib/api';
import { Department, DepartmentFormData, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Pencil, Trash2, Users, UserPlus, X } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    headOfDepartment: '',
  });
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [depts, users] = await Promise.all([
        departmentApi.getAll(),
        userApi.getAllUsers(),
      ]);
      setDepartments(depts);
      setAllUsers(users);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', headOfDepartment: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      headOfDepartment: typeof dept.headOfDepartment === 'object' && dept.headOfDepartment
        ? dept.headOfDepartment._id || dept.headOfDepartment.id
        : (dept.headOfDepartment as string) || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Department name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingDept) {
        await departmentApi.update(editingDept._id, formData);
        toast({ title: 'Success', description: 'Department updated successfully' });
      } else {
        await departmentApi.create(formData);
        toast({ title: 'Success', description: 'Department created successfully' });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save department',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await departmentApi.delete(id);
      toast({ title: 'Success', description: 'Department deleted successfully' });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete department',
        variant: 'destructive',
      });
    }
  };

  const getMemberCount = (dept: Department) => {
    return dept.members.length;
  };

  const getHeadName = (dept: Department) => {
    if (!dept.headOfDepartment) return 'Not assigned';
    if (typeof dept.headOfDepartment === 'object') {
      return `${dept.headOfDepartment.firstName} ${dept.headOfDepartment.lastName}`;
    }
    return 'Unknown';
  };

  const openMembersDialog = (dept: Department) => {
    setSelectedDept(dept);
    setSelectedUserId('');
    setIsMembersDialogOpen(true);
  };

  const handleAddMember = async () => {
    if (!selectedDept || !selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select an employee to add',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAddingMember(true);
      await departmentApi.addMember(selectedDept._id, selectedUserId);
      toast({
        title: 'Success',
        description: 'Employee added to department successfully',
      });
      setSelectedUserId('');
      loadData();
      // Refresh selected department
      const updatedDept = await departmentApi.getById(selectedDept._id);
      setSelectedDept(updatedDept);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add employee',
        variant: 'destructive',
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedDept) return;

    if (!confirm('Are you sure you want to remove this employee from the department?')) {
      return;
    }

    try {
      await departmentApi.removeMember(selectedDept._id, userId);
      toast({
        title: 'Success',
        description: 'Employee removed from department successfully',
      });
      loadData();
      // Refresh selected department
      const updatedDept = await departmentApi.getById(selectedDept._id);
      setSelectedDept(updatedDept);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove employee',
        variant: 'destructive',
      });
    }
  };

  // Get available employees (not already in the department)
  const getAvailableEmployees = () => {
    if (!selectedDept) return [];
    const memberIds = selectedDept.members.map((m) =>
      typeof m === 'object' ? (m._id || m.id || '') : m
    ).filter((id): id is string => !!id);
    return allUsers.filter((user) => !memberIds.includes(user.id) && !(user._id && memberIds.includes(user._id)));
  };

  // Get member name
  const getMemberName = (member: any) => {
    if (typeof member === 'object') {
      return `${member.firstName} ${member.lastName}`;
    }
    const user = allUsers.find((u) => u.id === member || u._id === member);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Departments</h1>
          <p className="text-muted-foreground text-sm">Manage organization departments</p>
        </div>
        <Button onClick={openAddDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{departments.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{allUsers.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">
                {departments.length > 0
                  ? Math.round(
                      departments.reduce((sum, d) => sum + d.members.length, 0) / departments.length
                    )
                  : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead className="min-w-[150px]">Head</TableHead>
                    <TableHead className="min-w-[100px]">Members</TableHead>
                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <TableRow key={dept._id}>
                        <TableCell className="font-medium whitespace-nowrap">{dept.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {dept.description || '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{getHeadName(dept)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline">
                            {getMemberCount(dept)} {getMemberCount(dept) === 1 ? 'member' : 'members'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openMembersDialog(dept)}
                              title="Manage Members"
                            >
                              <Users className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(dept)}
                              title="Edit Department"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(dept._id)}
                              title="Delete Department"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No departments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDept ? 'Edit Department' : 'Add Department'}
            </DialogTitle>
            <DialogDescription>
              {editingDept ? 'Update department details' : 'Create a new department'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Engineering, Sales, HR"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the department"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="head">Department Head</Label>
                <Select
                  value={formData.headOfDepartment || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, headOfDepartment: value === 'none' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department head" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {allUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingDept ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Members - {selectedDept?.name}
            </DialogTitle>
            <DialogDescription>
              Add or remove employees from this department
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Members */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Current Members ({selectedDept?.members.length || 0})
              </h3>
              {selectedDept && selectedDept.members.length > 0 ? (
                <div className="space-y-2">
                  {selectedDept.members.map((member, index) => {
                    const memberId = typeof member === 'object' 
                      ? (member._id || member.id) 
                      : member;
                    return (
                      <div
                        key={memberId || index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{getMemberName(member)}</p>
                            {typeof member === 'object' && member.employeeId && (
                              <p className="text-xs text-muted-foreground">
                                ID: {member.employeeId}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(memberId || '')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No members in this department yet
                </p>
              )}
            </div>

            {/* Add Member */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Add Employee</h3>
              <div className="flex gap-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select an employee to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableEmployees().length > 0 ? (
                      getAvailableEmployees().map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                          {user.employeeId && ` (${user.employeeId})`}
                          {user.department && ` - ${user.department}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No available employees
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || isAddingMember}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              {getAvailableEmployees().length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  All employees are already in this department
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMembersDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

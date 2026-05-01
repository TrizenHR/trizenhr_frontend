'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { User, UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Grid3x3, List, Mail, Briefcase, Calendar as CalendarIcon, UserCheck, UserX, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<User[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departments: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, roleFilter, departmentFilter, statusFilter]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getAllUsers();
      setEmployees(data);
      
      // Calculate stats
      const uniqueDepartments = new Set(data.filter(e => e.department).map(e => e.department));
      setStats({
        total: data.length,
        active: data.filter(e => e.isActive).length,
        inactive: data.filter(e => !e.isActive).length,
        departments: uniqueDepartments.size,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.firstName.toLowerCase().includes(query) ||
          e.lastName.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.employeeId?.toLowerCase().includes(query) ||
          e.department?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((e) => e.role === roleFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter((e) => e.department === departmentFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((e) => e.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((e) => !e.isActive);
    }

    setFilteredEmployees(filtered);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.ADMIN]: 'bg-red-100 text-red-800',
      [UserRole.HR]: 'bg-blue-100 text-blue-800',
      [UserRole.SUPERVISOR]: 'bg-green-100 text-green-800',
      [UserRole.EMPLOYEE]: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const uniqueDepartments = Array.from(new Set(employees.filter(e => e.department).map(e => e.department)));

  const goToEditUser = (employee: User) => {
    const userId = employee.id || employee._id;
    if (!userId) return;
    router.push(`/dashboard/users/${userId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Directory</h1>
          <p className="text-muted-foreground">Manage and view all employees</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.active}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.inactive}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{stats.departments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Name, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRole.EMPLOYEE}>Employee</SelectItem>
                  <SelectItem value={UserRole.SUPERVISOR}>Supervisor</SelectItem>
                  <SelectItem value={UserRole.HR}>HR</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept!}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List/Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
          <CardDescription>
            {viewMode === 'table' ? 'Table view' : 'Grid view'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : viewMode === 'table' ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee._id}>
                        <TableCell className="font-medium">{employee.employeeId || '-'}</TableCell>
                        <TableCell>
                          {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {employee.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(employee.role)} variant="outline">
                            {employee.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{employee.department || '-'}</TableCell>
                        <TableCell>
                          {employee.createdAt
                            ? format(new Date(employee.createdAt), 'MMM dd, yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {employee.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToEditUser(employee)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <Card key={employee._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {employee.firstName} {employee.lastName}
                          </CardTitle>
                          <CardDescription>{employee.employeeId || 'No ID'}</CardDescription>
                        </div>
                        {employee.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <Badge className={getRoleBadgeColor(employee.role)} variant="outline">
                          {employee.role}
                        </Badge>
                      </div>
                      {employee.department && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.department}</span>
                        </div>
                      )}
                      {employee.createdAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Joined {format(new Date(employee.createdAt), 'MMM yyyy')}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToEditUser(employee)}
                          className="cursor-pointer w-full"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit User
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No employees found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

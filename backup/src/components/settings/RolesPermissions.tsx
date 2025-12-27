
import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  X, 
  Edit,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RolesPermissionsProps {
  onChange: () => void;
}

// Mock data for roles
const initialRoles = [
  { 
    id: 1, 
    name: 'Super Admin', 
    description: 'Full access to all modules and features', 
    users: 2,
    isSystem: true,
    permissions: {
      dashboard: ['view', 'create', 'edit', 'delete'],
      employees: ['view', 'create', 'edit', 'delete'],
      attendance: ['view', 'create', 'edit', 'delete'],
      leaves: ['view', 'create', 'edit', 'delete', 'approve'],
      reports: ['view', 'create', 'edit', 'delete'],
      settings: ['view', 'create', 'edit', 'delete']
    }
  },
  { 
    id: 2, 
    name: 'Admin', 
    description: 'Access to most modules except critical settings', 
    users: 3,
    isSystem: false,
    permissions: {
      dashboard: ['view', 'create', 'edit'],
      employees: ['view', 'create', 'edit'],
      attendance: ['view', 'create', 'edit'],
      leaves: ['view', 'create', 'edit', 'approve'],
      reports: ['view', 'create'],
      settings: ['view']
    }
  },
  { 
    id: 3, 
    name: 'HR Manager', 
    description: 'Access to HR-related modules and approvals', 
    users: 5,
    isSystem: false,
    permissions: {
      dashboard: ['view'],
      employees: ['view', 'create', 'edit'],
      attendance: ['view', 'create', 'edit'],
      leaves: ['view', 'approve'],
      reports: ['view'],
      settings: ['view']
    }
  },
  { 
    id: 4, 
    name: 'Department Head', 
    description: 'Access to team management and approvals', 
    users: 8,
    isSystem: false,
    permissions: {
      dashboard: ['view'],
      employees: ['view'],
      attendance: ['view'],
      leaves: ['view', 'approve'],
      reports: ['view'],
      settings: []
    }
  },
  { 
    id: 5, 
    name: 'Employee', 
    description: 'Regular employee with basic access', 
    users: 42,
    isSystem: true,
    permissions: {
      dashboard: ['view'],
      employees: [],
      attendance: ['view'],
      leaves: ['view', 'create'],
      reports: [],
      settings: []
    }
  }
];

const modules = [
  { id: 'dashboard', name: 'Dashboard', permissions: ['view', 'create', 'edit', 'delete'] },
  { id: 'employees', name: 'Employee Management', permissions: ['view', 'create', 'edit', 'delete'] },
  { id: 'attendance', name: 'Attendance', permissions: ['view', 'create', 'edit', 'delete'] },
  { id: 'leaves', name: 'Leave Management', permissions: ['view', 'create', 'edit', 'delete', 'approve'] },
  { id: 'reports', name: 'Reports', permissions: ['view', 'create', 'edit', 'delete'] },
  { id: 'settings', name: 'Settings', permissions: ['view', 'create', 'edit', 'delete'] }
];

// Employees for role assignment (mock data)
const employees = [
  { id: 1, name: 'John Smith', email: 'john.smith@trizen.com', role: 'HR Manager' },
  { id: 2, name: 'Emma Johnson', email: 'emma.johnson@trizen.com', role: 'Employee' },
  { id: 3, name: 'Michael Brown', email: 'michael.brown@trizen.com', role: 'Department Head' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@trizen.com', role: 'Employee' },
  { id: 5, name: 'David Taylor', email: 'david.taylor@trizen.com', role: 'Admin' }
];

const RolesPermissions: React.FC<RolesPermissionsProps> = ({ onChange }) => {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState<typeof initialRoles[0] | null>(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editedRoleName, setEditedRoleName] = useState('');
  const [editedRoleDescription, setEditedRoleDescription] = useState('');
  const [openRoleId, setOpenRoleId] = useState<number | null>(null);
  const [isAssigningRoles, setIsAssigningRoles] = useState(false);

  const handleAddRole = () => {
    setIsAddingRole(true);
    setEditedRoleName('');
    setEditedRoleDescription('');
  };

  const handleEditRole = (role: typeof initialRoles[0]) => {
    setSelectedRole(role);
    setEditedRoleName(role.name);
    setEditedRoleDescription(role.description);
    setIsEditingRole(true);
  };

  const handleSaveRole = () => {
    if (isAddingRole) {
      const newRole = {
        id: roles.length + 1,
        name: editedRoleName,
        description: editedRoleDescription,
        users: 0,
        isSystem: false,
        permissions: {
          dashboard: ['view'],
          employees: [],
          attendance: [],
          leaves: [],
          reports: [],
          settings: []
        }
      };
      setRoles([...roles, newRole]);
      setIsAddingRole(false);
      onChange();
    } else if (isEditingRole && selectedRole) {
      const updatedRoles = roles.map(role => 
        role.id === selectedRole.id 
          ? { ...role, name: editedRoleName, description: editedRoleDescription }
          : role
      );
      setRoles(updatedRoles);
      setIsEditingRole(false);
      setSelectedRole(null);
      onChange();
    }
  };

  const handleTogglePermission = (roleId: number, moduleId: string, permission: string) => {
    setRoles(prevRoles => {
      return prevRoles.map(role => {
        if (role.id === roleId) {
          const updatedPermissions = { ...role.permissions };
          if (updatedPermissions[moduleId as keyof typeof updatedPermissions].includes(permission)) {
            updatedPermissions[moduleId as keyof typeof updatedPermissions] = 
              updatedPermissions[moduleId as keyof typeof updatedPermissions].filter(p => p !== permission);
          } else {
            updatedPermissions[moduleId as keyof typeof updatedPermissions] = 
              [...updatedPermissions[moduleId as keyof typeof updatedPermissions], permission];
          }
          return { ...role, permissions: updatedPermissions };
        }
        return role;
      });
    });
    onChange();
  };

  const handleToggleCollapse = (roleId: number) => {
    setOpenRoleId(openRoleId === roleId ? null : roleId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Roles & Permissions</h2>
        <p className="text-gray-500 text-sm">Define what different roles can access in the system</p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <Badge variant="outline" className="mr-2">
            Total Roles: {roles.length}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAssigningRoles} onOpenChange={setIsAssigningRoles}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Assign Roles
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Assign Roles to Employees</DialogTitle>
                <DialogDescription>
                  Manage role assignments for all employees in the system
                </DialogDescription>
              </DialogHeader>
              
              <div className="max-h-[400px] overflow-y-auto mt-4">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>New Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map(employee => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <select className="rounded-md border bg-transparent px-3 py-1 text-sm">
                            <option value="">Select Role</option>
                            {roles.map(role => (
                              <option key={role.id} value={role.id} selected={role.name === employee.role}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsAssigningRoles(false)}>Cancel</Button>
                <Button onClick={() => {
                  setIsAssigningRoles(false);
                  onChange();
                }}>
                  Save Assignments
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddingRole || isEditingRole} onOpenChange={(open) => {
            if (!open) {
              setIsAddingRole(false);
              setIsEditingRole(false);
              setSelectedRole(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddRole}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isAddingRole ? 'Create New Role' : 'Edit Role'}</DialogTitle>
                <DialogDescription>
                  {isAddingRole 
                    ? 'Define a new role and its permissions in the system' 
                    : 'Modify this role\'s name and description'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input 
                    id="role-name" 
                    placeholder="e.g., Project Manager" 
                    value={editedRoleName}
                    onChange={(e) => setEditedRoleName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Input 
                    id="role-description" 
                    placeholder="Brief description of this role's responsibilities" 
                    value={editedRoleDescription}
                    onChange={(e) => setEditedRoleDescription(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddingRole(false);
                  setIsEditingRole(false);
                  setSelectedRole(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRole} disabled={!editedRoleName.trim()}>
                  {isAddingRole ? 'Create Role' : 'Update Role'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {roles.map(role => (
          <Card key={role.id} className={openRoleId === role.id ? "border-primary" : ""}>
            <Collapsible open={openRoleId === role.id} onOpenChange={() => handleToggleCollapse(role.id)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      {role.isSystem && <Badge variant="secondary">System Role</Badge>}
                    </div>
                    <CardDescription className="mt-1">{role.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{role.users} Users</Badge>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {openRoleId === role.id ? "Hide Permissions" : "View Permissions"}
                      </Button>
                    </CollapsibleTrigger>
                    {!role.isSystem && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRole(role);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CollapsibleContent>
                <CardContent>
                  <Separator className="mb-4" />
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[180px]">Module</TableHead>
                          {['View', 'Create', 'Edit', 'Delete', 'Approve'].map(perm => (
                            <TableHead key={perm} className="text-center">
                              {perm}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modules.map(module => (
                          <TableRow key={module.id}>
                            <TableCell className="font-medium">{module.name}</TableCell>
                            {['view', 'create', 'edit', 'delete', 'approve'].map(permission => (
                              <TableCell key={permission} className="text-center">
                                {module.permissions.includes(permission) ? (
                                  <Checkbox 
                                    checked={role.permissions[module.id as keyof typeof role.permissions].includes(permission)}
                                    onCheckedChange={() => handleTogglePermission(role.id, module.id, permission)}
                                    disabled={role.isSystem}
                                  />
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RolesPermissions;

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Loader2, DollarSign, Edit } from 'lucide-react';
import { payrollApi, userApi } from '@/lib/api';
import { SalaryStructure, User, Allowance, Deduction } from '@/lib/types';
import { canManagePayroll } from '@/lib/permissions';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function SalaryStructuresPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canManage = user ? canManagePayroll(user.role) : false;

  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [filteredStructures, setFilteredStructures] = useState<SalaryStructure[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);

  const [formData, setFormData] = useState({
    userId: '',
    baseSalary: 0,
    allowances: [] as Allowance[],
    deductions: [] as Deduction[],
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  useEffect(() =>{
    loadData();
  }, []);

  useEffect(() => {
    filterStructures();
  }, [searchTerm, structures]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [structuresData, usersData] = await Promise.all([
        payrollApi.getAllSalaryStructures(),
        userApi.getAllUsers(),
      ]);
      setStructures(structuresData);
      setUsers(usersData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterStructures = () => {
    let filtered = structures;

    if (searchTerm) {
      filtered = filtered.filter((structure) => {
        const userData = typeof structure.userId === 'object' ? structure.userId : null;
        return (
          userData?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userData?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userData?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userData?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredStructures(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStructure) {
        await payrollApi.updateSalaryStructure(
          typeof editingStructure.userId === 'string'
            ? editingStructure.userId
            : editingStructure.userId._id,
          formData
        );
        toast.success('Salary structure updated successfully');
      } else {
        await payrollApi.createSalaryStructure(formData);
        toast.success('Salary structure created successfully');
      }

      setIsDialogOpen(false);
      setEditingStructure(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save salary structure');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      baseSalary: 0,
      allowances: [],
      deductions: [],
      effectiveFrom: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (structure: SalaryStructure) => {
    setEditingStructure(structure);
    setFormData({
      userId: typeof structure.userId === 'string' ? structure.userId : structure.userId._id,
      baseSalary: structure.baseSalary,
      allowances: structure.allowances,
      deductions: structure.deductions,
      effectiveFrom: structure.effectiveFrom.split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const addAllowance = () => {
    setFormData((prev) => ({
      ...prev,
      allowances: [...prev.allowances, { name: '', amount: 0, type: 'fixed' as const }],
    }));
  };

  const addDeduction = () => {
    setFormData((prev) => ({
      ...prev,
      deductions: [...prev.deductions, { name: '', amount: 0, type: 'fixed' as const }],
    }));
  };

  if (!canManage) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Structures</h1>
          <p className="text-gray-500">Manage employee salary components</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingStructure(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Salary Structure
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Structures Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredStructures.length}{' '}
            {filteredStructures.length === 1 ? 'Structure' : 'Structures'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredStructures.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No salary structures found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStructures.map((structure) => {
                  const userData = typeof structure.userId === 'object' ? structure.userId : null;
                  return (
                    <TableRow key={structure._id}>
                      <TableCell className="font-medium">
                        {userData ? `${userData.firstName} ${userData.lastName}` : 'N/A'}
                      </TableCell>
                      <TableCell>{userData?.employeeId || '-'}</TableCell>
                      <TableCell>₹{structure.baseSalary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{structure.allowances.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{structure.deductions.length}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(structure.effectiveFrom).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(structure)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStructure ? 'Edit Salary Structure' : 'Create Salary Structure'}
            </DialogTitle>
            <DialogDescription>
              Define base salary, allowances, and deductions for the employee
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee Selection */}
            {!editingStructure && (
              <div>
                <Label>Employee</Label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select Employee</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.employeeId || u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Base Salary */}
            <div>
              <Label>Base Salary (₹)</Label>
              <Input
                type="number"
                required
                min="0"
                value={formData.baseSalary}
                onChange={(e) =>
                  setFormData({ ...formData, baseSalary: parseFloat(e.target.value) })
                }
              />
            </div>

            {/* Effective Date */}
            <div>
              <Label>Effective From</Label>
              <Input
                type="date"
                required
                value={formData.effectiveFrom}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveFrom: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingStructure ? 'Update' : 'Create'} Salary Structure
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

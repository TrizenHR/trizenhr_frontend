'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Plus, Loader2, DollarSign, Play, Eye } from 'lucide-react';
import { payrollApi } from '@/lib/api';
import { PayrollRun, PayrollRunStatus, PayrollRecord } from '@/lib/types';
import { canProcessPayroll } from '@/lib/permissions';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function PayrollPage() {
  const { user } = useAuth();
  const canManage = user ? canProcessPayroll(user.role) : false;

  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [runDetails, setRunDetails] = useState<(PayrollRun & { records: PayrollRecord[] }) | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      setIsLoading(true);
      const data = await payrollApi.getPayrollRuns();
      setRuns(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load payroll runs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await payrollApi.createPayrollRun(formData.month, formData.year);
      toast.success('Payroll run created successfully');
      setIsDialogOpen(false);
      loadRuns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create payroll run');
    }
  };

  const handleProcessRun = async (runId: string) => {
    if (!confirm('This will calculate salaries for all employees. Continue?')) return;

    try {
      setIsProcessing(true);
      await payrollApi.processPayrollRun(runId);
      toast.success('Payroll processed successfully');
      loadRuns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process payroll');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = async (run: PayrollRun) => {
    try {
      const details = await payrollApi.getPayrollRun(run._id);
      setRunDetails(details);
      setSelectedRun(run);
    } catch (error: any) {
      toast.error(error.response?.data?.message ||  'Failed to load payroll details');
    }
  };

  const getStatusBadge = (status: PayrollRunStatus) => {
    const variants: Record<PayrollRunStatus, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      [PayrollRunStatus.DRAFT]: { variant: 'secondary', label: 'Draft' },
      [PayrollRunStatus.PROCESSING]: { variant: 'default', label: 'Processing' },
      [PayrollRunStatus.COMPLETED]: { variant: 'default', label: 'Completed' },
      [PayrollRunStatus.CANCELLED]: { variant: 'destructive', label: 'Cancelled' },
    };
    return variants[status];
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Payroll Processing</h1>
          <p className="text-gray-500">Process monthly payroll for all employees</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Payroll Run
        </Button>
      </div>

      {/* Payroll Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : runs.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No payroll runs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => {
                  const statusInfo = getStatusBadge(run.status);
                  return (
                    <TableRow key={run._id}>
                      <TableCell className="font-medium">
                        {monthNames[run.month - 1]} {run.year}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>{run.employeeCount || 0}</TableCell>
                      <TableCell>₹{run.totalGrossSalary.toLocaleString()}</TableCell>
                      <TableCell>₹{run.totalDeductions.toLocaleString()}</TableCell>
                      <TableCell>₹{run.totalNetSalary.toLocaleString()}</TableCell>
                      <TableCell>
                        {run.processedAt
                          ? new Date(run.processedAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {run.status === PayrollRunStatus.DRAFT && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessRun(run._id)}
                            disabled={isProcessing}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Process
                          </Button>
                        )}
                        {run.status === PayrollRunStatus.COMPLETED && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(run)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Run Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payroll Run</DialogTitle>
            <DialogDescription>
              Create a new payroll run for a specific month and year
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRun} className="space-y-4">
            <div>
              <Label>Month</Label>
              <select
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Year</Label>
              <select
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Payroll Run</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payroll Details - {selectedRun && `${monthNames[selectedRun.month - 1]} ${selectedRun.year}`}
            </DialogTitle>
          </DialogHeader>

          {runDetails && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{runDetails.employeeCount}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{runDetails.totalGrossSalary.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Net</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{runDetails.totalNetSalary.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Employee Records */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Employee Payroll Records</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runDetails.records.map((record) => {
                      const empData = typeof record.userId === 'object' ? record.userId : null;
                      return (
                        <TableRow key={record._id}>
                          <TableCell>
                            {empData ? `${empData.firstName} ${empData.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {record.daysWorked}/{record.workingDays}
                          </TableCell>
                          <TableCell>₹{record.grossSalary.toLocaleString()}</TableCell>
                          <TableCell>₹{record.totalDeductions.toLocaleString()}</TableCell>
                          <TableCell>₹{record.netSalary.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

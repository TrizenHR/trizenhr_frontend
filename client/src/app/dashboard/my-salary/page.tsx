'use client';

import { useEffect, useState } from 'react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, DollarSign, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { payrollApi } from '@/lib/api';
import { PayrollRecord, Allowance, Deduction } from '@/lib/types';
import { toast } from 'sonner';

export default function MySalaryPage() {
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    loadPayslips();
  }, [selectedYear]);

  const loadPayslips = async () => {
    try {
      setIsLoading(true);
      const data = await payrollApi.getMyPayslips(selectedYear);
      setPayslips(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load payslips');
    } finally {
      setIsLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Salary</h1>
        <p className="text-gray-500">View your salary details and payslips</p>
      </div>

      {/* Year Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="rounded-md border border-gray-300 px-4 py-2"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payslips */}
      <Card>
        <CardHeader>
          <CardTitle>Payslips - {selectedYear}</CardTitle>
          <CardDescription>
            {payslips.length} {payslips.length === 1 ? 'payslip' : 'payslips'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : payslips.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No payslips found for {selectedYear}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Days Worked</TableHead>
                  <TableHead>Leave Days</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips
                  .sort((a, b) => b.month - a.month)
                  .map((payslip) => (
                    <TableRow key={payslip._id}>
                      <TableCell className="font-medium">
                        {monthNames[payslip.month - 1]}
                      </TableCell>
                      <TableCell>{payslip.workingDays}</TableCell>
                      <TableCell>{payslip.daysWorked}</TableCell>
                      <TableCell>{payslip.leaveDays}</TableCell>
                      <TableCell>₹{payslip.grossSalary.toLocaleString()}</TableCell>
                      <TableCell>₹{payslip.totalDeductions.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{payslip.netSalary.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payslip.status === 'paid' ? 'default' : 'secondary'}
                        >
                          {payslip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPayslip(payslip)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payslip Details Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payslip - {selectedPayslip && monthNames[selectedPayslip.month - 1]} {selectedPayslip?.year}
            </DialogTitle>
          </DialogHeader>

          {selectedPayslip && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div>
                  <div className="text-sm text-gray-500">Working Days</div>
                  <div className="text-lg font-semibold">{selectedPayslip.workingDays}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Days Worked</div>
                  <div className="text-lg font-semibold">{selectedPayslip.daysWorked}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Leave Days</div>
                  <div className="text-lg font-semibold">{selectedPayslip.leaveDays}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Absent Days</div>
                  <div className="text-lg font-semibold text-red-600">{selectedPayslip.absentDays}</div>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <ChevronDown className="h-5 w-5 mr-2" />
                  Earnings
                </h3>
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span>Base Salary</span>
                    <span className="font-medium">₹{selectedPayslip.baseSalary.toLocaleString()}</span>
                  </div>
                  {selectedPayslip.allowances.map((allowance: Allowance, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{allowance.name}</span>
                      <span className="font-medium">₹{allowance.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Gross Salary</span>
                    <span>₹{selectedPayslip.grossSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <ChevronUp className="h-5 w-5 mr-2" />
                  Deductions
                </h3>
                <div className="space-y-2 rounded-lg border p-4">
                  {selectedPayslip.deductions.length === 0 ? (
                    <div className="text-sm text-gray-500">No deductions</div>
                  ) : (
                    <>
                      {selectedPayslip.deductions.map((deduction: Deduction, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{deduction.name}</span>
                          <span className="font-medium text-red-600">
                            -₹{deduction.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Deductions</span>
                        <span className="text-red-600">
                          -₹{selectedPayslip.totalDeductions.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Net Salary */}
              <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Net Salary</span>
                  <span className="text-2xl font-bold text-green-700">
                    ₹{selectedPayslip.netSalary.toLocaleString()}
                  </span>
                </div>
                {selectedPayslip.paidAt && (
                  <div className="text-sm text-gray-600 mt-2">
                    Paid on: {new Date(selectedPayslip.paidAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

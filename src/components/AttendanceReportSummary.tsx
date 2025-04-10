
import React from 'react';
import { Users, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import StatusSummaryCard from './StatusSummaryCard';

// In a real app, this would be fetched from an API
const summaryData = {
  totalEmployees: 42,
  workingDays: 21,
  presentRate: 87,
  absentRate: 8,
  leaveRate: 5,
  lateMarks: 15,
  totalRegularizations: 7,
  pendingRegularizations: 2,
};

const AttendanceReportSummary: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">{summaryData.totalEmployees}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 border-t pt-2">
            <p className="text-sm text-muted-foreground">Working Days: <span className="font-medium">{summaryData.workingDays} days</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{summaryData.presentRate}%</p>
                <p className="text-sm text-muted-foreground mb-1">present</p>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-2 border-t flex justify-between">
            <p className="text-sm text-muted-foreground">Absent: <span className="font-medium text-red-600">{summaryData.absentRate}%</span></p>
            <p className="text-sm text-muted-foreground">Leave: <span className="font-medium text-yellow-600">{summaryData.leaveRate}%</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Late Marks</p>
              <p className="text-2xl font-bold">{summaryData.lateMarks}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 border-t pt-2">
            <p className="text-sm text-muted-foreground">Average: <span className="font-medium">{Math.round(summaryData.lateMarks / summaryData.totalEmployees * 100)}% of employees</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Regularization Requests</p>
              <p className="text-2xl font-bold">{summaryData.totalRegularizations}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <AlertCircle className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 border-t pt-2">
            <p className="text-sm text-muted-foreground">Pending: <span className="font-medium text-yellow-600">{summaryData.pendingRegularizations}</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReportSummary;

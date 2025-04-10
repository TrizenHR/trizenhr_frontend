
import React from 'react';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DateRange } from 'react-day-picker';

// Mock data for monthly summary
const mockMonthlyData = [
  {
    id: "EMP001",
    name: "John Smith",
    department: "IT",
    designation: "Software Engineer",
    workingDays: 22,
    present: 20,
    absent: 0,
    leave: 2,
    lateMarks: 3,
    regularizations: 1,
    attendancePercent: 91
  },
  {
    id: "EMP002",
    name: "Jane Doe",
    department: "HR",
    designation: "HR Manager",
    workingDays: 22,
    present: 22,
    absent: 0,
    leave: 0,
    lateMarks: 5,
    regularizations: 0,
    attendancePercent: 100
  },
  {
    id: "EMP003",
    name: "Robert Johnson",
    department: "Finance",
    designation: "Accountant",
    workingDays: 22,
    present: 18,
    absent: 2,
    leave: 2,
    lateMarks: 1,
    regularizations: 2,
    attendancePercent: 82
  },
  {
    id: "EMP004",
    name: "Emily Wilson",
    department: "Marketing",
    designation: "Marketing Specialist",
    workingDays: 22,
    present: 17,
    absent: 0,
    leave: 5,
    lateMarks: 0,
    regularizations: 0,
    attendancePercent: 77
  },
  {
    id: "EMP005",
    name: "Michael Brown",
    department: "IT",
    designation: "System Administrator",
    workingDays: 22,
    present: 21,
    absent: 1,
    leave: 0,
    lateMarks: 2,
    regularizations: 1,
    attendancePercent: 95
  }
];

interface MonthlyReportProps {
  dateRange?: DateRange;
  department: string;
  designation: string;
  searchQuery: string;
  statusFilter: string;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({
  dateRange,
  department,
  designation,
  searchQuery,
  statusFilter
}) => {
  // In a real app, this would filter based on props
  const filteredData = mockMonthlyData;
  
  // Get month name from date range
  const monthName = dateRange?.from ? format(dateRange.from, 'MMMM yyyy') : 'Current Month';

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium">Monthly Attendance Summary</h2>
        <p className="text-sm text-muted-foreground">
          Showing summary for {monthName}
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Working Days</TableHead>
              <TableHead>Present</TableHead>
              <TableHead>Absent</TableHead>
              <TableHead>Leave</TableHead>
              <TableHead>Late Marks</TableHead>
              <TableHead>Regularizations</TableHead>
              <TableHead>Attendance %</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.id}</TableCell>
                <TableCell>
                  <div>
                    <div>{record.name}</div>
                    <div className="text-xs text-muted-foreground">{record.department} · {record.designation}</div>
                  </div>
                </TableCell>
                <TableCell>{record.workingDays}</TableCell>
                <TableCell>{record.present}</TableCell>
                <TableCell>{record.absent}</TableCell>
                <TableCell>{record.leave}</TableCell>
                <TableCell>{record.lateMarks}</TableCell>
                <TableCell>{record.regularizations}</TableCell>
                <TableCell>
                  <div className="w-24">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{record.attendancePercent}%</span>
                    </div>
                    <Progress value={record.attendancePercent} className="h-2" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MonthlyReport;

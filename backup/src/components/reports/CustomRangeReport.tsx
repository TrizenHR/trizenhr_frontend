
import React from 'react';
import { format, eachDayOfInterval, isValid } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

// Mock data for custom range report
const mockEmployees = [
  {
    id: "EMP001",
    name: "John Smith",
    department: "IT",
    designation: "Software Engineer",
  },
  {
    id: "EMP002",
    name: "Jane Doe",
    department: "HR", 
    designation: "HR Manager",
  },
  {
    id: "EMP003",
    name: "Robert Johnson",
    department: "Finance",
    designation: "Accountant",
  },
  {
    id: "EMP004",
    name: "Emily Wilson",
    department: "Marketing",
    designation: "Marketing Specialist",
  },
  {
    id: "EMP005",
    name: "Michael Brown",
    department: "IT",
    designation: "System Administrator",
  }
];

// Generate random attendance data for each date
const getAttendanceStatus = (empId: string, date: Date) => {
  // To make it deterministic based on employee and date
  const seed = `${empId}-${format(date, 'yyyy-MM-dd')}`;
  const hash = Array.from(seed).reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const rand = Math.abs(hash % 100);
  
  // Weekend logic
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { status: 'WO', statusText: 'Week Off' };
  }
  
  if (rand < 85) {
    return { status: 'P', statusText: 'Present' };
  } else if (rand < 90) {
    return { status: 'A', statusText: 'Absent' };
  } else if (rand < 95) {
    return { status: 'L', statusText: 'Leave' };
  } else {
    return { status: 'R', statusText: 'Regularized' };
  }
};

interface CustomRangeReportProps {
  dateRange?: DateRange;
  department: string;
  designation: string;
  searchQuery: string;
  statusFilter: string;
}

const CustomRangeReport: React.FC<CustomRangeReportProps> = ({
  dateRange,
  department,
  designation,
  searchQuery,
  statusFilter
}) => {
  // Filter employees based on department, designation, and search query
  // In a real app, this would use the props to filter
  const filteredEmployees = mockEmployees;
  
  // Get dates for the selected range
  const dates = dateRange?.from && dateRange?.to && isValid(dateRange.from) && isValid(dateRange.to)
    ? eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
    : [];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'P':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">P</Badge>;
      case 'A':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">A</Badge>;
      case 'L':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">L</Badge>;
      case 'R':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">R</Badge>;
      case 'WO':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">WO</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium">Custom Range Attendance Report</h2>
        <p className="text-sm text-muted-foreground">
          {dateRange?.from && dateRange?.to 
            ? `Showing data for ${format(dateRange.from, "MMM dd, yyyy")} to ${format(dateRange.to, "MMM dd, yyyy")}`
            : 'Please select a date range'}
        </p>
      </div>

      {dates.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 bg-muted/50">Employee</TableHead>
                {dates.map((date) => (
                  <TableHead key={date.toISOString()} className="text-center whitespace-nowrap">
                    <div>{format(date, "EEE")}</div>
                    <div>{format(date, "dd MMM")}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="sticky left-0 bg-white font-medium">
                    <div>
                      <div>{employee.name}</div>
                      <div className="text-xs text-muted-foreground">{employee.id}</div>
                    </div>
                  </TableCell>
                  {dates.map((date) => {
                    const attendance = getAttendanceStatus(employee.id, date);
                    return (
                      <TableCell key={date.toISOString()} className="text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(attendance.status)}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-md">
          Please select a date range to view the custom range report
        </div>
      )}
      
      <div className="mt-4 flex gap-3">
        <div className="text-sm flex items-center">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-1">P</Badge>
          <span>Present</span>
        </div>
        <div className="text-sm flex items-center">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mr-1">A</Badge>
          <span>Absent</span>
        </div>
        <div className="text-sm flex items-center">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mr-1">L</Badge>
          <span>Leave</span>
        </div>
        <div className="text-sm flex items-center">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mr-1">R</Badge>
          <span>Regularized</span>
        </div>
        <div className="text-sm flex items-center">
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 mr-1">WO</Badge>
          <span>Week Off</span>
        </div>
      </div>
    </div>
  );
};

export default CustomRangeReport;

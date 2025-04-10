
import React from 'react';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock data for daily attendance
const mockDailyData = [
  {
    id: "EMP001",
    name: "John Smith",
    department: "IT",
    designation: "Software Engineer",
    status: "P",
    inTime: "09:00 AM",
    outTime: "06:00 PM",
    workHours: "9h 00m",
    late: false,
    earlyExit: false,
    location: "Main Office"
  },
  {
    id: "EMP002",
    name: "Jane Doe",
    department: "HR",
    designation: "HR Manager",
    status: "P",
    inTime: "09:45 AM",
    outTime: "06:15 PM",
    workHours: "8h 30m",
    late: true,
    earlyExit: false,
    location: "Main Office"
  },
  {
    id: "EMP003",
    name: "Robert Johnson",
    department: "Finance",
    designation: "Accountant",
    status: "A",
    inTime: "-",
    outTime: "-",
    workHours: "-",
    late: false,
    earlyExit: false,
    location: "Main Office"
  },
  {
    id: "EMP004",
    name: "Emily Wilson",
    department: "Marketing",
    designation: "Marketing Specialist",
    status: "L",
    inTime: "-",
    outTime: "-",
    workHours: "-",
    late: false,
    earlyExit: false,
    location: "Branch Office"
  },
  {
    id: "EMP005",
    name: "Michael Brown",
    department: "IT",
    designation: "System Administrator",
    status: "P",
    inTime: "08:30 AM",
    outTime: "05:00 PM",
    workHours: "8h 30m",
    late: false,
    earlyExit: false,
    location: "Main Office"
  },
  {
    id: "EMP006",
    name: "Sarah Miller",
    department: "Operations",
    designation: "Operations Manager",
    status: "P",
    inTime: "09:15 AM",
    outTime: "04:30 PM",
    workHours: "7h 15m",
    late: false,
    earlyExit: true,
    location: "Branch Office"
  },
  {
    id: "EMP007",
    name: "David Taylor",
    department: "Finance",
    designation: "Financial Analyst",
    status: "R",
    inTime: "10:00 AM",
    outTime: "07:00 PM",
    workHours: "9h 00m",
    late: true,
    earlyExit: false,
    location: "Main Office"
  }
];

interface DailyReportProps {
  date: Date;
  department: string;
  designation: string;
  searchQuery: string;
  statusFilter: string;
}

const DailyReport: React.FC<DailyReportProps> = ({
  date,
  department,
  designation,
  searchQuery,
  statusFilter
}) => {
  // In a real app, this would filter data based on the props
  const filteredData = mockDailyData;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'P':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Present</Badge>;
      case 'A':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Absent</Badge>;
      case 'L':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Leave</Badge>;
      case 'R':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Regularized</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium">Daily Attendance Report</h2>
        <p className="text-sm text-muted-foreground">
          Showing attendance for {format(date, "MMMM dd, yyyy")}
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>In-Time</TableHead>
              <TableHead>Out-Time</TableHead>
              <TableHead>Work Hours</TableHead>
              <TableHead>Late</TableHead>
              <TableHead>Early Exit</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.id}</TableCell>
                <TableCell>{record.name}</TableCell>
                <TableCell>{record.department}</TableCell>
                <TableCell>{record.designation}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>{record.inTime}</TableCell>
                <TableCell>{record.outTime}</TableCell>
                <TableCell>{record.workHours}</TableCell>
                <TableCell>
                  {record.late ? 
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Yes</Badge> : 
                    "No"}
                </TableCell>
                <TableCell>
                  {record.earlyExit ? 
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Yes</Badge> : 
                    "No"}
                </TableCell>
                <TableCell>{record.location}</TableCell>
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

export default DailyReport;

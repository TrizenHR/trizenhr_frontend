
import React from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data for regularization report
const mockRegularizationData = [
  {
    id: "REG001",
    employeeId: "EMP001",
    employeeName: "John Smith",
    department: "IT",
    date: "2025-04-05",
    status: "Approved",
    reason: "Forgot to punch in due to urgent client meeting",
    adminComments: "Approved as verified with team lead",
    requestedInTime: "09:00 AM",
    requestedOutTime: "06:00 PM",
    approvedInTime: "09:00 AM",
    approvedOutTime: "06:00 PM"
  },
  {
    id: "REG002",
    employeeId: "EMP002",
    employeeName: "Jane Doe",
    department: "HR",
    date: "2025-04-06",
    status: "Pending",
    reason: "System issue while punching out",
    adminComments: "",
    requestedInTime: "09:30 AM",
    requestedOutTime: "06:30 PM",
    approvedInTime: "",
    approvedOutTime: ""
  },
  {
    id: "REG003",
    employeeId: "EMP003",
    employeeName: "Robert Johnson",
    department: "Finance",
    date: "2025-04-07",
    status: "Rejected",
    reason: "Missed punch-in",
    adminComments: "No valid proof provided",
    requestedInTime: "08:30 AM",
    requestedOutTime: "05:30 PM",
    approvedInTime: "",
    approvedOutTime: ""
  },
  {
    id: "REG004",
    employeeId: "EMP005",
    employeeName: "Michael Brown",
    department: "IT",
    date: "2025-04-08",
    status: "Approved",
    reason: "Working from client location",
    adminComments: "Confirmed with project manager",
    requestedInTime: "09:15 AM",
    requestedOutTime: "07:00 PM",
    approvedInTime: "09:15 AM",
    approvedOutTime: "07:00 PM"
  },
  {
    id: "REG005",
    employeeId: "EMP007",
    employeeName: "David Taylor",
    department: "Finance",
    date: "2025-04-09",
    status: "Pending",
    reason: "Biometric not working",
    adminComments: "",
    requestedInTime: "08:45 AM",
    requestedOutTime: "05:45 PM",
    approvedInTime: "",
    approvedOutTime: ""
  }
];

interface RegularizationReportProps {
  dateRange?: DateRange;
  department: string;
  designation: string;
  searchQuery: string;
  statusFilter: string;
}

const RegularizationReport: React.FC<RegularizationReportProps> = ({
  dateRange,
  department,
  designation,
  searchQuery,
  statusFilter
}) => {
  // In a real app, this would filter based on props
  const filteredData = mockRegularizationData;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
  };

  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "MMM dd, yyyy")} to ${format(dateRange.to, "MMM dd, yyyy")}`
    : "All time";

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium">Regularization Summary Report</h2>
        <p className="text-sm text-muted-foreground">
          Showing regularization requests for {dateRangeText}
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested Time</TableHead>
              <TableHead>Approved Time</TableHead>
              <TableHead>Admin Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {record.employeeName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{record.employeeName}</div>
                      <div className="text-xs text-muted-foreground">{record.employeeId} · {record.department}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{record.reason}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    In: {record.requestedInTime}
                    <br />
                    Out: {record.requestedOutTime}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {record.status === "Approved" ? (
                      <>
                        In: {record.approvedInTime}
                        <br />
                        Out: {record.approvedOutTime}
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {record.adminComments || <span className="text-muted-foreground">-</span>}
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

export default RegularizationReport;

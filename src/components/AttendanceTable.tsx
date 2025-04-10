
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  shiftGroup: string;
  firstCheckIn: string;
  lastCheckOut: string;
  date: string;
  totalWorkHours: string;
  status: string;
}

interface AttendanceTableProps {
  data: AttendanceRecord[];
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">
              Employee ID <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              Employee Name <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              Department <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              Shift Group <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              First Check-In <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              Last Check-Out <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="whitespace-nowrap">Total Work Hours</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Action</TableHead>
            <TableHead className="whitespace-nowrap">History</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => (
            <TableRow key={record.employeeId}>
              <TableCell>{record.employeeId}</TableCell>
              <TableCell>{record.employeeName}</TableCell>
              <TableCell>{record.department}</TableCell>
              <TableCell>{record.shiftGroup}</TableCell>
              <TableCell>{record.firstCheckIn}</TableCell>
              <TableCell>{record.lastCheckOut}</TableCell>
              <TableCell>{record.date}</TableCell>
              <TableCell>{record.totalWorkHours}</TableCell>
              <TableCell>
                {record.status === 'A' && (
                  <span className="text-status-absent font-semibold">A</span>
                )}
                {record.status === 'P' && (
                  <span className="text-status-present font-semibold">P</span>
                )}
                {record.status === 'L' && (
                  <span className="text-status-leave font-semibold">L</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="link" className="text-blue-500 p-0 h-auto">
                  Regularize
                </Button>
              </TableCell>
              <TableCell>-</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;

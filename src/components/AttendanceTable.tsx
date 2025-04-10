
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
        <TableHeader className="bg-white">
          <TableRow>
            <TableHead className="font-semibold text-center whitespace-nowrap text-gray-800">
              Employee ID <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="font-semibold text-left whitespace-nowrap text-gray-800">
              Employee Name <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="font-semibold text-left whitespace-nowrap text-gray-800">
              Department <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="font-semibold text-center whitespace-nowrap text-gray-800">
              Shift Group <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="font-semibold text-center whitespace-nowrap text-gray-800">
              First Check-In <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="font-semibold text-center whitespace-nowrap text-gray-800">
              Last Check-Out <span className="inline-flex ml-1"><ChevronUp size={14} /><ChevronDown size={14} /></span>
            </TableHead>
            <TableHead className="font-semibold text-center whitespace-nowrap text-gray-800">Date</TableHead>
            <TableHead className="font-semibold text-center whitespace-nowrap text-gray-800">Total Work Hours</TableHead>
            <TableHead className="font-semibold text-center whitespace-nowrap text-gray-800">Status</TableHead>
            <TableHead className="font-semibold text-center whitespace-nowrap text-gray-800">Action</TableHead>
            <TableHead className="font-semibold text-center whitespace-nowrap text-gray-800">History</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => (
            <TableRow key={record.employeeId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="text-center">{record.employeeId}</TableCell>
              <TableCell className="text-left font-medium uppercase">{record.employeeName}</TableCell>
              <TableCell className="text-left uppercase">{record.department}</TableCell>
              <TableCell className="text-center uppercase">{record.shiftGroup}</TableCell>
              <TableCell className="text-center">{record.firstCheckIn}</TableCell>
              <TableCell className="text-center">{record.lastCheckOut}</TableCell>
              <TableCell className="text-center">{record.date}</TableCell>
              <TableCell className="text-center">{record.totalWorkHours}</TableCell>
              <TableCell className="text-center">
                {record.status === 'A' && (
                  <span className="text-status-absent font-bold">A</span>
                )}
                {record.status === 'P' && (
                  <span className="text-status-present font-bold">P</span>
                )}
                {record.status === 'L' && (
                  <span className="text-status-leave font-bold">L</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Button variant="link" className="text-blue-500 p-0 h-auto font-normal hover:underline">
                  Regularize
                </Button>
              </TableCell>
              <TableCell className="text-center">-</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;

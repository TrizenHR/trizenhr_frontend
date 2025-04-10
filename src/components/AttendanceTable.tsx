
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clock, ChevronUp, ChevronDown, Eye, Edit, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setViewDetailsOpen(true);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'P':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-status-present">Present</span>;
      case 'A':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-status-absent">Absent</span>;
      case 'L':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-status-leave">Leave</span>;
      case 'WFH':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-status-wfh">WFH</span>;
      case 'R':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-status-weekoff">Regularized</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record, index) => (
              <TableRow key={record.employeeId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="text-center">{record.employeeId}</TableCell>
                <TableCell className="text-left font-medium">{record.employeeName}</TableCell>
                <TableCell className="text-left">{record.department}</TableCell>
                <TableCell className="text-center">{record.shiftGroup}</TableCell>
                <TableCell className="text-center">{record.firstCheckIn}</TableCell>
                <TableCell className="text-center">{record.lastCheckOut}</TableCell>
                <TableCell className="text-center">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-center">{record.totalWorkHours}</TableCell>
                <TableCell className="text-center">
                  {renderStatusBadge(record.status)}
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem 
                        onClick={() => handleViewDetails(record)}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Regularize</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>
              Detail view of employee attendance record.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Employee</p>
                  <p className="text-sm font-semibold">
                    {selectedRecord.employeeName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="text-sm">{selectedRecord.employeeId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-sm">{selectedRecord.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm">
                    {new Date(selectedRecord.date).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div>{renderStatusBadge(selectedRecord.status)}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Work Hours</p>
                  <p className="text-sm">{selectedRecord.totalWorkHours}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">First Check-In</p>
                  <p className="text-sm">{selectedRecord.firstCheckIn}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Last Check-Out</p>
                  <p className="text-sm">{selectedRecord.lastCheckOut}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Activity Log</h4>
                <div className="space-y-3">
                  {selectedRecord.firstCheckIn !== "-" && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Check-In</p>
                        <p className="text-xs text-gray-500">
                          {selectedRecord.firstCheckIn} via Mobile App
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedRecord.lastCheckOut !== "-" && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Check-Out</p>
                        <p className="text-xs text-gray-500">
                          {selectedRecord.lastCheckOut} via Mobile App
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedRecord.firstCheckIn === "-" && selectedRecord.status === "A" && (
                    <p className="text-sm text-red-500">No activity recorded</p>
                  )}
                  {selectedRecord.firstCheckIn === "-" && selectedRecord.status === "L" && (
                    <p className="text-sm text-yellow-500">On approved leave</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttendanceTable;

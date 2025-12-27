
// Mock data for attendance records

import { AttendanceRecord } from '@/components/AttendanceTable';

export const mockAttendanceData: AttendanceRecord[] = [
  {
    employeeId: "EMP0001",
    employeeName: "John Smith",
    department: "IT",
    shiftGroup: "General",
    firstCheckIn: "09:15 AM",
    lastCheckOut: "06:30 PM",
    date: "2025-04-10",
    totalWorkHours: "9h 15m",
    status: "P"
  },
  {
    employeeId: "EMP0002",
    employeeName: "Sarah Johnson",
    department: "HR",
    shiftGroup: "General",
    firstCheckIn: "10:05 AM",
    lastCheckOut: "07:10 PM",
    date: "2025-04-10",
    totalWorkHours: "9h 05m",
    status: "P"
  },
  {
    employeeId: "EMP0003",
    employeeName: "Michael Brown",
    department: "Finance",
    shiftGroup: "General",
    firstCheckIn: "-",
    lastCheckOut: "-",
    date: "2025-04-10",
    totalWorkHours: "-",
    status: "A"
  },
  {
    employeeId: "EMP0004",
    employeeName: "Jessica Davis",
    department: "Marketing",
    shiftGroup: "General",
    firstCheckIn: "-",
    lastCheckOut: "-",
    date: "2025-04-10",
    totalWorkHours: "-",
    status: "L"
  },
  {
    employeeId: "EMP0005",
    employeeName: "David Wilson",
    department: "Operations",
    shiftGroup: "Flexible",
    firstCheckIn: "08:30 AM",
    lastCheckOut: "05:45 PM",
    date: "2025-04-10",
    totalWorkHours: "9h 15m",
    status: "P"
  },
  {
    employeeId: "EMP0006",
    employeeName: "Emily Taylor",
    department: "IT",
    shiftGroup: "Flexible",
    firstCheckIn: "09:30 AM",
    lastCheckOut: "06:15 PM",
    date: "2025-04-10",
    totalWorkHours: "8h 45m",
    status: "P"
  },
  {
    employeeId: "EMP0007",
    employeeName: "Robert Martinez",
    department: "Finance",
    shiftGroup: "General",
    firstCheckIn: "-",
    lastCheckOut: "-",
    date: "2025-04-10",
    totalWorkHours: "-",
    status: "A"
  },
  {
    employeeId: "EMP0008",
    employeeName: "Jennifer Anderson",
    department: "HR",
    shiftGroup: "General",
    firstCheckIn: "08:45 AM",
    lastCheckOut: "05:30 PM",
    date: "2025-04-10",
    totalWorkHours: "8h 45m",
    status: "P"
  },
  {
    employeeId: "EMP0009",
    employeeName: "Daniel Thompson",
    department: "Marketing",
    shiftGroup: "Flexible",
    firstCheckIn: "10:15 AM",
    lastCheckOut: "07:00 PM",
    date: "2025-04-10",
    totalWorkHours: "8h 45m",
    status: "P"
  },
  {
    employeeId: "EMP0010",
    employeeName: "Amanda White",
    department: "Operations",
    shiftGroup: "General",
    firstCheckIn: "-",
    lastCheckOut: "-",
    date: "2025-04-10",
    totalWorkHours: "-",
    status: "L"
  }
];

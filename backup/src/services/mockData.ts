
import { AttendanceRecord } from "@/components/AttendanceTable";

export const mockAttendanceData: AttendanceRecord[] = [
  {
    employeeId: "N2712",
    employeeName: "NAGOMI TEST",
    department: "TELEMARKETING",
    shiftGroup: "GENERAL SHIFT",
    firstCheckIn: "08:55 AM",
    lastCheckOut: "-",
    date: "01-04-2025",
    totalWorkHours: "-",
    status: "A"
  },
  {
    employeeId: "N2161",
    employeeName: "MADHUMITHA TEST",
    department: "TELEMARKETING",
    shiftGroup: "GENERAL SHIFT",
    firstCheckIn: "02:55 PM",
    lastCheckOut: "-",
    date: "01-04-2025",
    totalWorkHours: "-",
    status: "A"
  },
  {
    employeeId: "N2666",
    employeeName: "DINESH TEST",
    department: "TELEMARKETING",
    shiftGroup: "GENERAL SHIFT",
    firstCheckIn: "03:25 PM",
    lastCheckOut: "-",
    date: "01-04-2025",
    totalWorkHours: "-",
    status: "A"
  },
  {
    employeeId: "N2369",
    employeeName: "Jenifer Test",
    department: "TELEMARKETING",
    shiftGroup: "GENERAL SHIFT",
    firstCheckIn: "09:42 AM",
    lastCheckOut: "-",
    date: "01-04-2025",
    totalWorkHours: "-",
    status: "A"
  },
  {
    employeeId: "N2777",
    employeeName: "SENTHAMIZHD TEST",
    department: "TELEMARKETING",
    shiftGroup: "GENERAL SHIFT",
    firstCheckIn: "11:51 AM",
    lastCheckOut: "-",
    date: "01-04-2025",
    totalWorkHours: "-",
    status: "A"
  }
];

export const summaryData = {
  present: 5,
  absent: 36,
  leave: 1,
  wfh: 0,
  weekOff: 0,
  holiday: 0,
  regularized: 0
};

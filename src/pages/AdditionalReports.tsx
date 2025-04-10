
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, FileSpreadsheet, FileUp, FileText, Filter, ChevronDown, BarChart2, PieChart, Clock, ArrowDownLeft, ArrowUpRight, Calendar, UserMinus, Timer, Coffee, UserX } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { toast } from '@/hooks/use-toast';

const AdditionalReports: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('late-report');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [department, setDepartment] = useState<string>('all');
  const [employee, setEmployee] = useState<string>('all');
  const [shift, setShift] = useState<string>('all');
  const [leaveType, setLeaveType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mock data for reports
  const lateComingData = [
    { id: 'N2712', name: 'John Smith', date: '2025-04-08', inTime: '09:45 AM', outTime: '06:30 PM', lateArrival: 'Yes', earlyExit: 'No', remarks: 'Traffic congestion' },
    { id: 'N2161', name: 'Emma Johnson', date: '2025-04-09', inTime: '09:30 AM', outTime: '05:45 PM', lateArrival: 'No', earlyExit: 'Yes', remarks: 'Doctor appointment' },
    { id: 'N2666', name: 'Michael Brown', date: '2025-04-08', inTime: '10:15 AM', outTime: '06:45 PM', lateArrival: 'Yes', earlyExit: 'No', remarks: 'Car breakdown' },
    { id: 'N2369', name: 'Sarah Wilson', date: '2025-04-10', inTime: '09:55 AM', outTime: '06:00 PM', lateArrival: 'Yes', earlyExit: 'No', remarks: '' },
    { id: 'N2777', name: 'David Taylor', date: '2025-04-09', inTime: '09:20 AM', outTime: '05:30 PM', lateArrival: 'No', earlyExit: 'Yes', remarks: 'Family emergency' }
  ];

  const shiftAdherenceData = [
    { id: 'N2712', name: 'John Smith', assignedShift: '09:00 AM - 06:00 PM', actualInTime: '09:45 AM', actualOutTime: '06:30 PM', deviation: '45 mins', date: '2025-04-08', remarks: 'Late arrival' },
    { id: 'N2161', name: 'Emma Johnson', assignedShift: '09:00 AM - 06:00 PM', actualInTime: '09:05 AM', actualOutTime: '05:45 PM', deviation: '15 mins', date: '2025-04-09', remarks: 'Early exit' },
    { id: 'N2666', name: 'Michael Brown', assignedShift: '09:00 AM - 06:00 PM', actualInTime: '10:15 AM', actualOutTime: '06:45 PM', deviation: '75 mins', date: '2025-04-08', remarks: 'Late arrival + overtime' },
    { id: 'N2369', name: 'Sarah Wilson', assignedShift: '08:30 AM - 05:30 PM', actualInTime: '08:40 AM', actualOutTime: '05:25 PM', deviation: '15 mins', date: '2025-04-10', remarks: 'Good adherence' },
    { id: 'N2777', name: 'David Taylor', assignedShift: '08:30 AM - 05:30 PM', actualInTime: '08:35 AM', actualOutTime: '04:30 PM', deviation: '60 mins', date: '2025-04-09', remarks: 'Left early' }
  ];

  const leaveBreakdownData = [
    { id: 'N2712', name: 'John Smith', leaveType: 'Sick Leave', daysAvailed: 4, remainingBalance: 8 },
    { id: 'N2161', name: 'Emma Johnson', leaveType: 'Casual Leave', daysAvailed: 2, remainingBalance: 6 },
    { id: 'N2161', name: 'Emma Johnson', leaveType: 'Earned Leave', daysAvailed: 5, remainingBalance: 10 },
    { id: 'N2666', name: 'Michael Brown', leaveType: 'Sick Leave', daysAvailed: 1, remainingBalance: 11 },
    { id: 'N2369', name: 'Sarah Wilson', leaveType: 'Casual Leave', daysAvailed: 3, remainingBalance: 5 },
    { id: 'N2777', name: 'David Taylor', leaveType: 'Sick Leave', daysAvailed: 0, remainingBalance: 12 }
  ];

  const absenteeismData = [
    { id: 'N2161', name: 'Emma Johnson', absenteeismScore: 0.15, absences: 3, pattern: 'Mondays', lastAbsence: '2025-04-01' },
    { id: 'N2666', name: 'Michael Brown', absenteeismScore: 0.10, absences: 2, pattern: 'Random', lastAbsence: '2025-03-24' },
    { id: 'N2712', name: 'John Smith', absenteeismScore: 0.20, absences: 4, pattern: 'Fridays', lastAbsence: '2025-04-05' },
    { id: 'N2369', name: 'Sarah Wilson', absenteeismScore: 0.05, absences: 1, pattern: 'None', lastAbsence: '2025-03-19' },
    { id: 'N2777', name: 'David Taylor', absenteeismScore: 0.25, absences: 5, pattern: 'Mondays/Fridays', lastAbsence: '2025-04-08' }
  ];

  const overtimeData = [
    { id: 'N2712', name: 'John Smith', date: '2025-04-03', workHours: 9, overtimeHours: 1, remarks: 'Project deadline' },
    { id: 'N2666', name: 'Michael Brown', date: '2025-04-05', workHours: 11, overtimeHours: 3, remarks: 'System maintenance' },
    { id: 'N2369', name: 'Sarah Wilson', date: '2025-04-07', workHours: 10, overtimeHours: 2, remarks: 'Client meeting' },
    { id: 'N2161', name: 'Emma Johnson', date: '2025-04-02', workHours: 9.5, overtimeHours: 1.5, remarks: 'Data analysis' },
    { id: 'N2777', name: 'David Taylor', date: '2025-04-08', workHours: 8.5, overtimeHours: 0.5, remarks: 'Training session' }
  ];

  const weekendWorkingData = [
    { id: 'N2666', name: 'Michael Brown', date: '2025-04-06', inTime: '10:00 AM', outTime: '03:00 PM', totalHours: 5, approvedBy: 'Linda Johnson' },
    { id: 'N2369', name: 'Sarah Wilson', date: '2025-04-06', inTime: '09:30 AM', outTime: '02:30 PM', totalHours: 5, approvedBy: 'Linda Johnson' },
    { id: 'N2777', name: 'David Taylor', date: '2025-03-30', inTime: '11:00 AM', outTime: '04:00 PM', totalHours: 5, approvedBy: 'Linda Johnson' },
    { id: 'N2712', name: 'John Smith', date: '2025-03-30', inTime: '10:30 AM', outTime: '03:30 PM', totalHours: 5, approvedBy: 'Robert Wilson' },
    { id: 'N2161', name: 'Emma Johnson', date: '2025-04-06', inTime: '09:00 AM', outTime: '01:00 PM', totalHours: 4, approvedBy: 'Robert Wilson' }
  ];

  const inactiveEmployeeData = [
    { id: 'N2112', name: 'Alex Miller', lastAttendanceDate: '2025-03-15', status: 'On Leave', department: 'IT' },
    { id: 'N2235', name: 'Jessica Williams', lastAttendanceDate: '2025-03-20', status: 'Inactive', department: 'Finance' },
    { id: 'N2387', name: 'Ryan Clark', lastAttendanceDate: '2025-03-10', status: 'On Leave', department: 'Marketing' },
    { id: 'N2492', name: 'Olivia Martinez', lastAttendanceDate: '2025-03-05', status: 'Inactive', department: 'HR' },
    { id: 'N2555', name: 'Daniel Garcia', lastAttendanceDate: '2025-03-25', status: 'On Long Leave', department: 'Operations' }
  ];

  // Chart data
  const lateArrivalsChartData = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 8 },
    { day: 'Wed', count: 7 },
    { day: 'Thu', count: 6 },
    { day: 'Fri', count: 15 }
  ];

  const leaveTypePieData = [
    { name: 'Sick Leave', value: 35 },
    { name: 'Casual Leave', value: 40 },
    { name: 'Earned Leave', value: 25 }
  ];

  const absenteeismTrendData = [
    { week: 'Week 1', count: 8 },
    { week: 'Week 2', count: 12 },
    { week: 'Week 3', count: 7 },
    { week: 'Week 4', count: 10 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    toast({
      title: "Report Export Started",
      description: `Your ${selectedTab} report is being prepared as ${format.toUpperCase()}. It will download shortly.`,
    });
    
    // In a real app, this would trigger an API call to generate the report
    setTimeout(() => {
      toast({
        title: "Report Downloaded",
        description: `Your ${selectedTab} report has been downloaded successfully.`,
      });
    }, 1500);
  };

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'it', label: 'IT' },
    { value: 'hr', label: 'HR' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Operations' }
  ];

  const employees = [
    { value: 'all', label: 'All Employees' },
    { value: 'N2712', label: 'John Smith' },
    { value: 'N2161', label: 'Emma Johnson' },
    { value: 'N2666', label: 'Michael Brown' },
    { value: 'N2369', label: 'Sarah Wilson' },
    { value: 'N2777', label: 'David Taylor' }
  ];

  const shifts = [
    { value: 'all', label: 'All Shifts' },
    { value: 'morning', label: 'Morning (09:00 AM - 06:00 PM)' },
    { value: 'evening', label: 'Evening (02:00 PM - 11:00 PM)' },
    { value: 'night', label: 'Night (10:00 PM - 07:00 AM)' }
  ];

  const leaveTypes = [
    { value: 'all', label: 'All Leave Types' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'casual', label: 'Casual Leave' },
    { value: 'earned', label: 'Earned Leave' }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Additional Reports</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-auto">
                <Download className="mr-2 h-4 w-4" />
                Export Report
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileUp className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <ArrowDownLeft className="h-8 w-8 mb-2 text-orange-500" />
              <CardTitle className="text-xl">45</CardTitle>
              <p className="text-sm text-gray-500">Late Entries This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <UserMinus className="h-8 w-8 mb-2 text-red-500" />
              <CardTitle className="text-xl">David Taylor</CardTitle>
              <p className="text-sm text-gray-500">Top Absentee (5 Days)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Calendar className="h-8 w-8 mb-2 text-blue-500" />
              <CardTitle className="text-xl">Casual Leave</CardTitle>
              <p className="text-sm text-gray-500">Most Availed Leave Type</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Timer className="h-8 w-8 mb-2 text-green-500" />
              <CardTitle className="text-xl">Michael Brown</CardTitle>
              <p className="text-sm text-gray-500">Overtime Leader (8 Hours)</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="mr-2 h-5 w-5 text-gray-500" />
            <h2 className="font-medium">Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <DatePickerWithRange
                className="w-full"
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <Select value={employee} onValueChange={setEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.value} value={emp.value}>
                      {emp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTab === 'shift-report' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedTab === 'leave-report' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((lt) => (
                      <SelectItem key={lt.value} value={lt.value}>
                        {lt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="mr-2">
                Reset
              </Button>
              <Button>
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="bg-white rounded-lg border p-4">
          <TabsList className="grid grid-cols-4 mb-4 lg:w-[800px] mx-auto">
            <TabsTrigger value="late-report">
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Late Coming Report
            </TabsTrigger>
            <TabsTrigger value="shift-report">
              <Clock className="mr-2 h-4 w-4" />
              Shift Adherence
            </TabsTrigger>
            <TabsTrigger value="leave-report">
              <Calendar className="mr-2 h-4 w-4" />
              Leave Breakdown
            </TabsTrigger>
            <TabsTrigger value="absenteeism-report">
              <UserMinus className="mr-2 h-4 w-4" />
              Absenteeism
            </TabsTrigger>
          </TabsList>

          <TabsList className="grid grid-cols-3 mb-4 lg:w-[600px] mx-auto">
            <TabsTrigger value="overtime-report">
              <Timer className="mr-2 h-4 w-4" />
              Overtime Report
            </TabsTrigger>
            <TabsTrigger value="weekend-report">
              <Coffee className="mr-2 h-4 w-4" />
              Weekend Working
            </TabsTrigger>
            <TabsTrigger value="inactive-report">
              <UserX className="mr-2 h-4 w-4" />
              Inactive Employees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="late-report">
            <div className="mb-4 rounded-lg bg-slate-50 border p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium mb-2">Daily Trend of Late Arrivals</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lateArrivalsChartData}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>In-Time</TableHead>
                  <TableHead>Out-Time</TableHead>
                  <TableHead>Late Arrival</TableHead>
                  <TableHead>Early Exit</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lateComingData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.inTime}</TableCell>
                    <TableCell>{row.outTime}</TableCell>
                    <TableCell>
                      <Badge variant={row.lateArrival === 'Yes' ? "destructive" : "outline"}>
                        {row.lateArrival}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.earlyExit === 'Yes' ? "destructive" : "outline"}>
                        {row.earlyExit}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="shift-report">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Assigned Shift</TableHead>
                  <TableHead>Actual In-Time</TableHead>
                  <TableHead>Actual Out-Time</TableHead>
                  <TableHead>Deviation</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shiftAdherenceData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.assignedShift}</TableCell>
                    <TableCell>{row.actualInTime}</TableCell>
                    <TableCell>{row.actualOutTime}</TableCell>
                    <TableCell>
                      <Badge variant={parseInt(row.deviation) > 30 ? "destructive" : parseInt(row.deviation) > 15 ? "warning" : "outline"}>
                        {row.deviation}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="leave-report">
            <div className="mb-4 rounded-lg bg-slate-50 border p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium mb-2">Leave Type Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leaveTypePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {leaveTypePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Days Availed</TableHead>
                  <TableHead>Remaining Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBreakdownData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.leaveType}</TableCell>
                    <TableCell>{row.daysAvailed}</TableCell>
                    <TableCell>{row.remainingBalance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="absenteeism-report">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg bg-slate-50 border p-4">
                <h3 className="text-lg font-medium mb-2">Top 5 Frequent Absentees</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  {absenteeismData.sort((a, b) => b.absences - a.absences).slice(0, 5).map((employee, index) => (
                    <li key={index}>
                      <span className="font-medium">{employee.name}</span> ({employee.absences} days)
                      <div className="text-sm text-gray-500">Pattern: {employee.pattern}</div>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="rounded-lg bg-slate-50 border p-4">
                <h3 className="text-lg font-medium mb-2">Absenteeism Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={absenteeismTrendData}>
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Absenteeism Score</TableHead>
                  <TableHead>Absences (Last 30 Days)</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Last Absence</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absenteeismData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.absenteeismScore.toFixed(2)}</TableCell>
                    <TableCell>{row.absences}</TableCell>
                    <TableCell>{row.pattern}</TableCell>
                    <TableCell>{row.lastAbsence}</TableCell>
                    <TableCell>
                      <Badge variant={row.absenteeismScore > 0.2 ? "destructive" : row.absenteeismScore > 0.1 ? "warning" : "outline"}>
                        {row.absenteeismScore > 0.2 ? "High" : row.absenteeismScore > 0.1 ? "Medium" : "Low"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="overtime-report">
            <div className="mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overtime Summary (Current Month)</CardTitle>
                  <CardDescription>Based on all approved overtime records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg bg-slate-50 p-4 text-center">
                      <p className="text-lg font-medium">Total Overtime Hours</p>
                      <p className="text-4xl font-bold text-blue-600">32.5</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 text-center">
                      <p className="text-lg font-medium">Department with Highest OT</p>
                      <p className="text-2xl font-semibold text-blue-600">IT Department</p>
                      <p className="text-sm text-gray-500">14.5 Hours</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 text-center">
                      <p className="text-lg font-medium">Avg. Overtime Per Employee</p>
                      <p className="text-4xl font-bold text-blue-600">1.6</p>
                      <p className="text-sm text-gray-500">Hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Overtime Hours</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overtimeData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.workHours} hours</TableCell>
                    <TableCell>
                      <Badge variant={row.overtimeHours > 2 ? "destructive" : "default"}>
                        {row.overtimeHours} hours
                      </Badge>
                    </TableCell>
                    <TableCell>{row.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="weekend-report">
            <div className="mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weekend Working Statistics</CardTitle>
                  <CardDescription>Statistics for the current month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-slate-50 p-4 text-center">
                      <p className="text-lg font-medium">Weekend Work Days</p>
                      <p className="text-4xl font-bold text-purple-600">5</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 text-center">
                      <p className="text-lg font-medium">Total Employees</p>
                      <p className="text-4xl font-bold text-purple-600">12</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 text-center">
                      <p className="text-lg font-medium">Total Hours</p>
                      <p className="text-4xl font-bold text-purple-600">58</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 text-center">
                      <p className="text-lg font-medium">Avg. Hours Per Person</p>
                      <p className="text-4xl font-bold text-purple-600">4.8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Weekend Date</TableHead>
                  <TableHead>In-Time</TableHead>
                  <TableHead>Out-Time</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Approved By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekendWorkingData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.inTime}</TableCell>
                    <TableCell>{row.outTime}</TableCell>
                    <TableCell>{row.totalHours} hours</TableCell>
                    <TableCell>{row.approvedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="inactive-report">
            <div className="mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inactive Employee Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inactiveEmployeeData.slice(0, 2).map((employee, index) => (
                      <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <UserX className="text-amber-500 mr-3 h-10 w-10" />
                          <div>
                            <h4 className="font-semibold text-lg">{employee.name} ({employee.id})</h4>
                            <p className="text-sm text-gray-600">Has not logged attendance since <span className="font-medium">{employee.lastAttendanceDate}</span> ({Math.floor((new Date().getTime() - new Date(employee.lastAttendanceDate).getTime()) / (1000 * 3600 * 24))} days)</p>
                            <p className="text-sm mt-1">Status: <Badge>{employee.status}</Badge></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Last Attendance Date</TableHead>
                  <TableHead>Days Since Last Attendance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveEmployeeData.map((row, index) => {
                  const daysSince = Math.floor((new Date().getTime() - new Date(row.lastAttendanceDate).getTime()) / (1000 * 3600 * 24));
                  return (
                    <TableRow key={index}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.lastAttendanceDate}</TableCell>
                      <TableCell>
                        <Badge variant={daysSince > 20 ? "destructive" : daysSince > 10 ? "warning" : "outline"}>
                          {daysSince} days
                        </Badge>
                      </TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Contact
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdditionalReports;

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, FileSpreadsheet, FileUp, FileText, Filter, ChevronDown, Eye } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithButton } from '@/components/DatePickerWithButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AttendanceReportSummary from '@/components/AttendanceReportSummary';
import DailyReport from '@/components/reports/DailyReport';
import MonthlyReport from '@/components/reports/MonthlyReport';
import CustomRangeReport from '@/components/reports/CustomRangeReport';
import RegularizationReport from '@/components/reports/RegularizationReport';
import { toast } from '@/hooks/use-toast';

const AttendanceReports: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 6))
  });
  const [department, setDepartment] = useState<string>('all');
  const [designation, setDesignation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
    { value: 'hr', label: 'Human Resources' },
    { value: 'it', label: 'Information Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Operations' },
  ];

  const designations = [
    { value: 'all', label: 'All Designations' },
    { value: 'manager', label: 'Manager' },
    { value: 'lead', label: 'Team Lead' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'analyst', label: 'Analyst' },
    { value: 'executive', label: 'Executive' },
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'P', label: 'Present' },
    { value: 'A', label: 'Absent' },
    { value: 'L', label: 'Leave' },
    { value: 'R', label: 'Regularized' },
    { value: 'LATE', label: 'Late' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Attendance Reports</h1>
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
        <AttendanceReportSummary />

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="mr-2 h-5 w-5 text-gray-500" />
            <h2 className="font-medium">Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {selectedTab === 'daily' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <DatePickerWithButton date={selectedDate} setDate={setSelectedDate} />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        if (range?.to) setIsCalendarOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <Select value={designation} onValueChange={setDesignation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((desig) => (
                    <SelectItem key={desig.value} value={desig.value}>
                      {desig.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search by ID or name"
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
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="daily">Daily Report</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
            <TabsTrigger value="custom">Custom Range</TabsTrigger>
            <TabsTrigger value="regularization">Regularization Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <DailyReport 
              date={selectedDate}
              department={department}
              designation={designation}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
            />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyReport 
              dateRange={dateRange}
              department={department}
              designation={designation}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
            />
          </TabsContent>

          <TabsContent value="custom">
            <CustomRangeReport 
              dateRange={dateRange}
              department={department}
              designation={designation}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
            />
          </TabsContent>

          <TabsContent value="regularization">
            <RegularizationReport 
              dateRange={dateRange}
              department={department}
              designation={designation}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceReports;

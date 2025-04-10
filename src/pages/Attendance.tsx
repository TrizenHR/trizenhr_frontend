
import React, { useState } from 'react';
import { Calendar, Filter, Download, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import AttendanceFilters from '@/components/AttendanceFilters';
import AttendanceTable from '@/components/AttendanceTable';
import AttendanceSummary from '@/components/AttendanceSummary';
import { mockAttendanceData } from '@/services/mockAttendanceData';
import { Badge } from '@/components/ui/badge';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState(mockAttendanceData);
  const [filteredData, setFilteredData] = useState(mockAttendanceData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Summary stats
  const totalEmployees = attendanceData.length;
  const presentCount = attendanceData.filter(record => record.status === 'P').length;
  const absentCount = attendanceData.filter(record => record.status === 'A').length;
  const leaveCount = attendanceData.filter(record => record.status === 'L').length;

  const handleFilterChange = (filteredData: any) => {
    setFilteredData(filteredData);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Attendance</h1>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex gap-2 items-center">
              <Upload size={16} />
              Import Attendance
            </Button>
            <Button variant="outline" className="flex gap-2 items-center">
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <AttendanceSummary 
          totalEmployees={totalEmployees}
          presentCount={presentCount}
          absentCount={absentCount}
          leaveCount={leaveCount}
        />

        {/* Filters Section */}
        <div className="mb-6">
          <div 
            className="flex justify-between items-center p-4 bg-white rounded-t-lg border border-gray-200 cursor-pointer"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <span className="font-medium">Filters</span>
              {filterOpen ? (
                <ChevronUp size={18} className="text-gray-500" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-gray-100">
                Department: All
              </Badge>
              <Badge variant="outline" className="bg-gray-100">
                Status: All
              </Badge>
              <Badge variant="outline" className="bg-gray-100">
                Date: Today
              </Badge>
            </div>
          </div>
          
          {filterOpen && (
            <AttendanceFilters 
              data={attendanceData} 
              onFilterChange={handleFilterChange} 
            />
          )}
        </div>

        {/* Table Section */}
        <AttendanceTable data={filteredData} />
      </div>
    </DashboardLayout>
  );
};

export default Attendance;

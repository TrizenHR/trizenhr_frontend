
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatusSummaryCard from '@/components/StatusSummaryCard';
import AttendanceTable from '@/components/AttendanceTable';
import { DatePickerWithButton } from '@/components/DatePickerWithButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { mockAttendanceData, summaryData } from '@/services/mockData';

const Index = () => {
  const [date, setDate] = useState<Date | undefined>(new Date("2025-04-01"));
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Regularization</h1>
        </div>
        
        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatusSummaryCard 
            label="Present" 
            count={summaryData.present} 
            color="#2ecc71" 
            bgColor="#eafaf1"
          />
          <StatusSummaryCard 
            label="Absent" 
            count={summaryData.absent} 
            color="#e74c3c" 
            bgColor="#fdedec"
          />
          <StatusSummaryCard 
            label="On Leave" 
            count={summaryData.leave} 
            color="#f1c40f" 
            bgColor="#fef9e7"
          />
          <StatusSummaryCard 
            label="Holiday" 
            count={summaryData.holiday} 
            color="#9b59b6" 
            bgColor="#f5eef8"
          />
          <StatusSummaryCard 
            label="Week off" 
            count={summaryData.weekOff} 
            color="#7f8c8d" 
            bgColor="#ecf0f1"
          />
          <StatusSummaryCard 
            label="Regularized" 
            count={summaryData.regularized} 
            color="#3498db" 
            bgColor="#d6eaf8"
          />
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <DatePickerWithButton date={date} setDate={setDate} />
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-gray-700"
            >
              <SlidersHorizontal size={16} />
              Customize Column
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} />
              Filter
            </Button>
          </div>
        </div>
        
        {/* Attendance Table */}
        <AttendanceTable data={mockAttendanceData} />
      </div>
    </DashboardLayout>
  );
};

export default Index;

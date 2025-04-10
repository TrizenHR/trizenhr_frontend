
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatusSummaryCard from '@/components/StatusSummaryCard';
import AttendanceTable from '@/components/AttendanceTable';
import { DatePickerWithButton } from '@/components/DatePickerWithButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, SlidersHorizontal, User, Calendar, Briefcase, Watch, AlertCircle, Clock } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatusSummaryCard 
            label="Present" 
            count={summaryData.present} 
            color="#2ecc71" 
            bgColor="#eafaf1"
            icon={<User size={16} className="text-[#2ecc71]" />}
          />
          <StatusSummaryCard 
            label="Absent" 
            count={summaryData.absent} 
            color="#e74c3c" 
            bgColor="#fdedec"
            icon={<AlertCircle size={16} className="text-[#e74c3c]" />}
          />
          <StatusSummaryCard 
            label="On Leave" 
            count={summaryData.leave} 
            color="#f1c40f" 
            bgColor="#fef9e7"
            icon={<Calendar size={16} className="text-[#f1c40f]" />}
          />
          <StatusSummaryCard 
            label="Holiday" 
            count={summaryData.holiday} 
            color="#9b59b6" 
            bgColor="#f5eef8"
            icon={<Calendar size={16} className="text-[#9b59b6]" />}
          />
          <StatusSummaryCard 
            label="Week off" 
            count={summaryData.weekOff} 
            color="#7f8c8d" 
            bgColor="#ecf0f1"
            icon={<Clock size={16} className="text-[#7f8c8d]" />}
          />
          <StatusSummaryCard 
            label="Regularized" 
            count={summaryData.regularized} 
            color="#3498db" 
            bgColor="#d6eaf8"
            icon={<Briefcase size={16} className="text-[#3498db]" />}
          />
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex md:items-center gap-4 flex-col md:flex-row">
            <div className="w-full md:w-auto">
              <DatePickerWithButton date={date} setDate={setDate} />
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-gray-700 bg-white"
            >
              <SlidersHorizontal size={16} />
              Customize Column
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-gray-700 bg-white"
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

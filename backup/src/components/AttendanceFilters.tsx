
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';

interface AttendanceFiltersProps {
  data: any[];
  onFilterChange: (filteredData: any[]) => void;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({ data, onFilterChange }) => {
  const [nameQuery, setNameQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'it', label: 'Information Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'marketing', label: 'Marketing' },
  ];

  const statusOptions = [
    { value: 'P', label: 'Present' },
    { value: 'A', label: 'Absent' },
    { value: 'L', label: 'On Leave' },
    { value: 'WFH', label: 'Work From Home' },
    { value: 'R', label: 'Regularized' },
  ];

  const applyFilters = () => {
    let filtered = [...data];
    
    if (nameQuery) {
      filtered = filtered.filter(item => 
        item.employeeName.toLowerCase().includes(nameQuery.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(nameQuery.toLowerCase())
      );
    }
    
    if (department !== 'all') {
      filtered = filtered.filter(item => item.department.toLowerCase() === department.toLowerCase());
    }
    
    if (status.length > 0) {
      filtered = filtered.filter(item => status.includes(item.status));
    }
    
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to || dateRange.from;
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    
    onFilterChange(filtered);
  };
  
  const resetFilters = () => {
    setNameQuery('');
    setDepartment('all');
    setStatus([]);
    setDateRange({
      from: new Date(),
      to: new Date(),
    });
    onFilterChange(data);
  };

  const handleStatusChange = (value: string, checked: boolean) => {
    setStatus(prev => 
      checked 
        ? [...prev, value]
        : prev.filter(item => item !== value)
    );
  };

  return (
    <div className="p-4 bg-white border border-t-0 border-gray-200 rounded-b-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="search" className="block mb-2">Search Employee</Label>
          <Input
            id="search"
            placeholder="Search by name or ID"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="department" className="block mb-2">Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Departments</SelectLabel>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block mb-2">Date Range</Label>
          <DatePickerWithRange 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
        </div>
      </div>

      <div className="mb-4">
        <Label className="block mb-2">Attendance Status</Label>
        <div className="flex flex-wrap gap-4">
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`status-${option.value}`} 
                checked={status.includes(option.value)}
                onCheckedChange={(checked) => 
                  handleStatusChange(option.value, checked as boolean)
                }
              />
              <label
                htmlFor={`status-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
        <Button onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default AttendanceFilters;

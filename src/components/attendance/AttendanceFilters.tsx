'use client';

import { useState } from 'react';
import { AttendanceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttendanceFiltersProps {
  onFilterChange: (filters: {
    startDate: Date | null;
    endDate: Date | null;
    status: AttendanceStatus | null;
  }) => void;
}

export function AttendanceFilters({ onFilterChange }: AttendanceFiltersProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<AttendanceStatus | null>(null);

  const handleApplyFilters = () => {
    onFilterChange({ startDate, endDate, status });
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStatus(null);
    onFilterChange({ startDate: null, endDate: null, status: null });
  };

  const hasActiveFilters = startDate || endDate || status;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Start Date */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Start Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate || undefined}
              onSelect={(date) => setStartDate(date || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">End Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !endDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate || undefined}
              onSelect={(date) => setEndDate(date || null)}
              disabled={(date) => startDate ? date < startDate : false}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Status</label>
        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? null : v as AttendanceStatus)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={AttendanceStatus.PRESENT}>Present</SelectItem>
            <SelectItem value={AttendanceStatus.LATE}>Late</SelectItem>
            <SelectItem value={AttendanceStatus.ABSENT}>Absent</SelectItem>
            <SelectItem value={AttendanceStatus.HALF_DAY}>Half Day</SelectItem>
            <SelectItem value={AttendanceStatus.ON_LEAVE}>On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-5">
        <Button onClick={handleApplyFilters} size="sm">
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button onClick={handleClearFilters} variant="outline" size="sm">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

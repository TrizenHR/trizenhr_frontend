import { format, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Format date for attendance display: "Mon, Jan 9"
 */
export function formatAttendanceDate(date: Date | string): string {
  return format(new Date(date), 'EEE, MMM d');
}

/**
 * Format time only: "09:30 AM"
 */
export function formatTimeOnly(date: Date | string): string {
  return format(new Date(date), 'hh:mm a');
}

/**
 * Get array of month options for selector
 */
export function getMonthOptions(): { value: number; label: string }[] {
  return [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];
}

/**
 * Get array of recent years for selector
 */
export function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  
  // Show current year and 2 years back
  for (let i = 0; i < 3; i++) {
    years.push(currentYear - i);
  }
  
  return years;
}

/**
 * Get start and end of month for filtering
 */
export function getMonthRange(month: number, year: number): { start: Date; end: Date } {
  const date = new Date(year, month, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

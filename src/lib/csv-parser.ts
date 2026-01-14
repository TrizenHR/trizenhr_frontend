/**
 * CSV Parser for Holiday Bulk Upload
 * Parses CSV file and validates holiday data
 */

import { HolidayType } from './types';

export interface ParsedHoliday {
  name: string;
  date: string; // ISO date string
  type: HolidayType;
  description?: string;
  isRecurring: boolean;
}

export interface ParseResult {
  holidays: ParsedHoliday[];
  errors: Array<{ row: number; error: string }>;
}

/**
 * Parse CSV content into holiday objects
 */
export function parseHolidayCSV(csvContent: string): ParseResult {
  const lines = csvContent.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  const holidays: ParsedHoliday[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  if (lines.length === 0) {
    errors.push({ row: 0, error: 'CSV file is empty' });
    return { holidays, errors };
  }

  // Parse header
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.trim().replace(/"/g, ''));

  // Find column indices
  const dateIndex = headers.findIndex((h) => h === 'date');
  const nameIndex = headers.findIndex((h) => h === 'name');
  const typeIndex = headers.findIndex((h) => h === 'type');
  const descriptionIndex = headers.findIndex((h) => h === 'description');
  const recurringIndex = headers.findIndex((h) => h === 'recurring');

  // Validate headers
  if (dateIndex === -1 || nameIndex === -1) {
    errors.push({
      row: 1,
      error: 'CSV must contain "Date" and "Name" columns',
    });
    return { holidays, errors };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);

    if (values.length === 0) continue; // Skip empty lines

    const rowErrors: string[] = [];

    // Extract values
    const dateStr = values[dateIndex]?.trim() || '';
    const name = values[nameIndex]?.trim() || '';
    const type = (values[typeIndex]?.trim() || 'company').toLowerCase();
    const description = values[descriptionIndex]?.trim() || undefined;
    const recurringStr = (values[recurringIndex]?.trim() || 'false').toLowerCase();

    // Validate name
    if (!name) {
      rowErrors.push('Name is required');
    }

    // Validate and parse date
    let date: Date | null = null;
    if (!dateStr) {
      rowErrors.push('Date is required');
    } else {
      date = parseDate(dateStr);
      if (!date || isNaN(date.getTime())) {
        rowErrors.push(`Invalid date format: ${dateStr}. Use YYYY-MM-DD format`);
      }
    }

    // Validate type
    const validTypes = ['national', 'company', 'optional'];
    if (type && !validTypes.includes(type)) {
      rowErrors.push(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Parse recurring
    const isRecurring = recurringStr === 'true' || recurringStr === '1' || recurringStr === 'yes';

    if (rowErrors.length > 0) {
      errors.push({
        row: i + 1,
        error: rowErrors.join('; '),
      });
      continue;
    }

    if (date && name) {
      holidays.push({
        name,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        type: (type || 'company') as HolidayType,
        description,
        isRecurring,
      });
    }
  }

  return { holidays, errors };
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last value
  values.push(current);

  return values;
}

/**
 * Parse date string in various formats
 */
function parseDate(dateStr: string): Date | null {
  // Try ISO format first (YYYY-MM-DD)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime()) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }

  // Try DD/MM/YYYY
  const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Try MM/DD/YYYY
  const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Try DD-MM-YYYY
  const ddmmyyyyDash = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyDash) {
    const [, day, month, year] = ddmmyyyyDash;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

/**
 * Generate CSV template content
 */
export function generateHolidayTemplate(): string {
  return `Date,Name,Type,Description,Recurring
2025-01-01,New Year's Day,national,First day of the year,true
2025-01-26,Republic Day,national,Indian Republic Day,true
2025-08-15,Independence Day,national,Indian Independence Day,true
2025-12-25,Christmas,company,Christmas holiday,true`;
}

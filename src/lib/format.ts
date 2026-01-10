/**
 * Format decimal hours into "X hrs Y mins" format
 * @param hours - Decimal hours (e.g., 2.5)
 * @returns Formatted string (e.g., "2 hrs 30 mins")
 */
export function formatWorkingHours(hours: number): string {
  if (!hours || hours < 0) return '0 mins';
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  if (minutes === 0) {
    return `${wholeHours} hr${wholeHours !== 1 ? 's' : ''}`;
  }
  
  return `${wholeHours} hr${wholeHours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
}

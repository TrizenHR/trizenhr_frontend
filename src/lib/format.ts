/**
 * Format decimal hours into "X hrs Y mins" format
 * @param hours - Decimal hours (e.g., 2.5)
 * @returns Formatted string (e.g., "2 hrs 30 mins")
 */
export function formatWorkingHours(hours: number): string {
  if (hours == null || Number.isNaN(hours) || hours < 0) return '0 mins 0 secs';

  // Store as total seconds to avoid rounding minutes up to 60.
  const totalSeconds = Math.max(0, Math.round(hours * 60 * 60));

  const wholeHours = Math.floor(totalSeconds / 3600);
  const remainingSecondsAfterHours = totalSeconds % 3600;
  const minutes = Math.floor(remainingSecondsAfterHours / 60);
  const seconds = remainingSecondsAfterHours % 60;

  // If less than 1 minute, show seconds too (requested).
  if (wholeHours === 0 && minutes === 0) {
    return `0 mins ${seconds} sec${seconds !== 1 ? 's' : ''}`;
  }

  if (wholeHours === 0) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }

  if (minutes === 0) {
    return `${wholeHours} hr${wholeHours !== 1 ? 's' : ''}`;
  }

  return `${wholeHours} hr${wholeHours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
}

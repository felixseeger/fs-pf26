/**
 * Date utilities module
 * General-purpose date formatting functions for use across the application
 */

// =============================================================================
// Types
// =============================================================================

export type DateInput = string | number | Date;

export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

// =============================================================================
// Core Formatting Functions
// =============================================================================

/**
 * Parse various date inputs into a Date object
 * @param date - Date string, timestamp, or Date object
 * @returns Date object
 */
export function parseDate(date: DateInput): Date {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
}

/**
 * Format a date with customizable options
 * @param date - Date input (string, timestamp, or Date)
 * @param options - Intl.DateTimeFormat options with optional locale
 * @returns Formatted date string
 */
export function formatDate(
  date: DateInput,
  options: DateFormatOptions = {}
): string {
  const { locale = 'en-US', ...formatOptions } = options;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...formatOptions,
  };

  try {
    return parseDate(date).toLocaleDateString(locale, defaultOptions);
  } catch {
    return String(date);
  }
}

/**
 * Format date in short format (e.g., "Jan 30, 2025")
 * @param date - Date input
 * @param locale - Locale string (default: 'en-US')
 * @returns Short formatted date string
 */
export function formatShortDate(date: DateInput, locale: string = 'en-US'): string {
  return formatDate(date, {
    locale,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date in long format (e.g., "January 30, 2025")
 * @param date - Date input
 * @param locale - Locale string (default: 'en-US')
 * @returns Long formatted date string
 */
export function formatLongDate(date: DateInput, locale: string = 'en-US'): string {
  return formatDate(date, {
    locale,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date in numeric format (e.g., "01/30/2025")
 * @param date - Date input
 * @param locale - Locale string (default: 'en-US')
 * @returns Numeric formatted date string
 */
export function formatNumericDate(date: DateInput, locale: string = 'en-US'): string {
  return formatDate(date, {
    locale,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date in ISO format (e.g., "2025-01-30")
 * @param date - Date input
 * @returns ISO formatted date string
 */
export function formatISODate(date: DateInput): string {
  return parseDate(date).toISOString().split('T')[0];
}

// =============================================================================
// Time Formatting
// =============================================================================

/**
 * Format time (e.g., "10:30 AM")
 * @param date - Date input
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted time string
 */
export function formatTime(date: DateInput, locale: string = 'en-US'): string {
  try {
    return parseDate(date).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return String(date);
  }
}

/**
 * Format date and time together (e.g., "Jan 30, 2025 at 10:30 AM")
 * @param date - Date input
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: DateInput, locale: string = 'en-US'): string {
  const dateStr = formatShortDate(date, locale);
  const timeStr = formatTime(date, locale);
  return `${dateStr} at ${timeStr}`;
}

// =============================================================================
// Relative Time
// =============================================================================

/**
 * Format date as relative time (e.g., "2 days ago", "in 3 hours")
 * @param date - Date input
 * @returns Relative time string
 */
export function formatRelativeTime(date: DateInput): string {
  try {
    const parsedDate = parseDate(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);
    const isFuture = diffInSeconds < 0;
    const absDiff = Math.abs(diffInSeconds);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(absDiff / interval.seconds);
      if (count >= 1) {
        const plural = count > 1 ? 's' : '';
        return isFuture
          ? `in ${count} ${interval.label}${plural}`
          : `${count} ${interval.label}${plural} ago`;
      }
    }

    return isFuture ? 'in a moment' : 'just now';
  } catch {
    return String(date);
  }
}

/**
 * Get time ago string (alias for formatRelativeTime for past dates)
 * @param date - Date input
 * @returns Time ago string
 */
export function timeAgo(date: DateInput): string {
  return formatRelativeTime(date);
}

// =============================================================================
// Date Comparison & Utilities
// =============================================================================

/**
 * Check if a date is today
 * @param date - Date input
 * @returns Boolean
 */
export function isToday(date: DateInput): boolean {
  const parsedDate = parseDate(date);
  const today = new Date();
  return (
    parsedDate.getDate() === today.getDate() &&
    parsedDate.getMonth() === today.getMonth() &&
    parsedDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is yesterday
 * @param date - Date input
 * @returns Boolean
 */
export function isYesterday(date: DateInput): boolean {
  const parsedDate = parseDate(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    parsedDate.getDate() === yesterday.getDate() &&
    parsedDate.getMonth() === yesterday.getMonth() &&
    parsedDate.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if a date is in the past
 * @param date - Date input
 * @returns Boolean
 */
export function isPast(date: DateInput): boolean {
  return parseDate(date).getTime() < Date.now();
}

/**
 * Check if a date is in the future
 * @param date - Date input
 * @returns Boolean
 */
export function isFuture(date: DateInput): boolean {
  return parseDate(date).getTime() > Date.now();
}

/**
 * Get the difference between two dates in days
 * @param date1 - First date
 * @param date2 - Second date (default: now)
 * @returns Number of days difference
 */
export function daysDifference(date1: DateInput, date2: DateInput = new Date()): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format date with smart display (Today, Yesterday, or date)
 * @param date - Date input
 * @param locale - Locale string (default: 'en-US')
 * @returns Smart formatted date string
 */
export function formatSmartDate(date: DateInput, locale: string = 'en-US'): string {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return formatShortDate(date, locale);
}

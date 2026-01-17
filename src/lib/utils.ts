import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert Philippine Time (UTC+8) to UTC
 * @param phDateTime - Date in Philippine timezone
 * @returns Date in UTC
 */
export function phToUtc(phDateTime: Date): Date {
  const utcDate = new Date(phDateTime.toLocaleString('en-US', { timeZone: 'UTC' }));
  return utcDate;
}

/**
 * Convert UTC to Philippine Time (UTC+8)
 * @param utcDateTime - Date in UTC
 * @returns Date in Philippine timezone
 */
export function utcToPh(utcDateTime: Date): Date {
  const phDate = new Date(utcDateTime.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  return phDate;
}

/**
 * Format date for display in Philippine timezone
 * @param date - Date to format
 * @param format - Format string (default: 'PPP')
 * @returns Formatted date string
 */
export function formatPhDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for display in Philippine timezone
 * @param date - Date to format
 * @returns Formatted time string
 */
export function formatPhTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 50): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

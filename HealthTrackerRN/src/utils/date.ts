import { format, isToday, isYesterday, parseISO, startOfWeek, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

// Today as YYYY-MM-DD
export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// Format any Date or ISO string → YYYY-MM-DD
export function toDateStr(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

// Human-readable relative date
export function relativeDate(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d))     return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

// Short date: "Apr 5"
export function shortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

// Time string: "10:30 PM"
export function timeStr(isoString: string): string {
  return format(parseISO(isoString), 'h:mm a');
}

// Last N days as YYYY-MM-DD strings, oldest first
export function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) =>
    format(subDays(new Date(), n - 1 - i), 'yyyy-MM-dd')
  );
}

// Day-of-week short label: "Mon"
export function dayLabel(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE');
}

// Single letter: "M"
export function dayLetter(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEEE');
}

// Is a date string representing today?
export function isDateToday(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

// Are two date strings the same day?
export function sameDay(a: string, b: string): boolean {
  return isSameDay(parseISO(a), parseISO(b));
}

// Start of current week (Monday) as Date
export function startOfThisWeek(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

// Medium date: "April 12, 2026"
export function mediumDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM d, yyyy');
}

// Short month: "Apr"
export function monthAbbr(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM');
}

// Day number: "12"
export function dayNum(dateStr: string): string {
  return format(parseISO(dateStr), 'd');
}

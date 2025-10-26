import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a timestamp to PST timezone
 * @param date - Date string or Date object
 * @param formatString - Format string (default: "MMM dd, yyyy h:mm a")
 * @returns Formatted date string in PST
 */
export function formatToPST(
  date: string | Date,
  formatString: string = "MMM dd, yyyy h:mm a"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const pstDate = toZonedTime(dateObj, "America/Los_Angeles")
  return format(pstDate, formatString)
}

/**
 * Format timestamp with both relative time and PST time
 * @param date - Date string or Date object
 * @returns String like "2 hours ago (Oct 26, 2025 2:30 PM PST)"
 */
export function formatTimestampWithPST(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true })
  const pstTime = formatToPST(dateObj, "MMM dd, h:mm a")
  return `${relativeTime} (${pstTime} PST)`
}

/**
 * Format timestamp to short PST format (for compact display)
 * @param date - Date string or Date object
 * @returns String like "2:30 PM PST"
 */
export function formatShortPST(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const pstTime = formatToPST(dateObj, "h:mm a")
  return `${pstTime} PST`
}

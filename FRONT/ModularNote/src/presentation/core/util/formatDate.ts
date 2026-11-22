const dateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const shortDateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
})

/**
 * Format a date for display, e.g. "26 oct. 2026, 14:05"
 * @param date - Date to format, shown in the user's time zone
 * @returns The date and time in French
 */
export function formatDate(date: Date): string {
  return dateFormatter.format(date)
}

/**
 * Format a date for a small space, e.g. "26/10"
 * @param date - Date to format, shown in the user's time zone
 * @returns The day and the month
 */
export function formatShortDate(date: Date): string {
  return shortDateFormatter.format(date)
}

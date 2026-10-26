const dateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/**
 * Format a date for display, e.g. "26 oct. 2026, 14:05"
 */
export function formatDate(date: Date): string {
  return dateFormatter.format(date)
}

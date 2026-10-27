/**
 * URL of every page, so that the links never hardcode a path
 */
type AppPaths = {
  /** List of the notes, with the full creation form and the details panel */
  notes: '/'
  /** Centered field to add ideas one after the other (US1.3) */
  quickAdd: '/quick-add'
}

/**
 * URL of every page of the application
 */
export const appPaths: AppPaths = {
  notes: '/',
  quickAdd: '/quick-add',
}

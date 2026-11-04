/**
 * URL of every page, so that the links never hardcode a path
 */
type AppPaths = {
  /** List of the notes, with the details panel */
  notes: '/'
  /** Full creation form of a note (title, description, linked notes) */
  newNote: '/new'
  /** Centered field to add ideas one after the other (US1.3) */
  quickAdd: '/quick-add'
}

/**
 * URL of every page of the application
 */
export const appPaths: AppPaths = {
  notes: '/',
  newNote: '/new',
  quickAdd: '/quick-add',
}

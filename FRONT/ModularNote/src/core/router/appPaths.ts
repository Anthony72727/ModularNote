/**
 * URL of every page, so that the links never hardcode a path
 */
type AppPaths = {
  /** List of the notes, with the details panel */
  notes: '/'
  /** Every note and its links on a canvas (US3.1) */
  canvas: '/canvas'
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
  canvas: '/canvas',
  newNote: '/new',
  quickAdd: '/quick-add',
}

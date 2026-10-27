/**
 * The requested note does not exist (anymore)
 */
export class NoteNotFoundError extends Error {
  /** Id of the note that was not found */
  readonly noteId: string

  /**
   * Create the error
   * @param noteId - Id of the note that was not found
   */
  constructor(noteId: string) {
    super(`The note ${noteId} was not found.`)
    this.name = 'NoteNotFoundError'
    this.noteId = noteId
  }
}

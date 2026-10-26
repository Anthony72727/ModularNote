/**
 * The requested note does not exist (anymore)
 */
export class NoteNotFoundError extends Error {
  readonly noteId: string

  constructor(noteId: string) {
    super(`The note ${noteId} was not found.`)
    this.name = 'NoteNotFoundError'
    this.noteId = noteId
  }
}

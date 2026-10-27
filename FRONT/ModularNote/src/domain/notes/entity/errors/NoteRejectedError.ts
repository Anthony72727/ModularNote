/**
 * The server refused the note because it breaks one of its rules
 * (the invalid field is unknown, unlike NoteValidationError which is raised before sending the note)
 */
export class NoteRejectedError extends Error {
  /**
   * Create the error
   */
  constructor() {
    super('The note was rejected by the server.')
    this.name = 'NoteRejectedError'
  }
}

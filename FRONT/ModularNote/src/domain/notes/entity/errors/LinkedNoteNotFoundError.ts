/**
 * The note was not created because at least one of the notes to link does not exist anymore
 */
export class LinkedNoteNotFoundError extends Error {
  /**
   * Create the error
   */
  constructor() {
    super('A linked note does not exist anymore.')
    this.name = 'LinkedNoteNotFoundError'
  }
}

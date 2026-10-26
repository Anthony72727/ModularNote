export type NoteField = 'title' | 'description'

/**
 * A note breaks a validation rule (the message shown to the user is chosen by the presentation layer)
 */
export class NoteValidationError extends Error {
  readonly field: NoteField

  constructor(field: NoteField) {
    super(`The note's ${field} is invalid.`)
    this.name = 'NoteValidationError'
    this.field = field
  }
}

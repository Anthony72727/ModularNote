/**
 * Field of a note that a validation rule applies to
 */
export type NoteField = 'title' | 'description'

/**
 * A note breaks a validation rule (the message shown to the user is chosen by the presentation layer)
 */
export class NoteValidationError extends Error {
  /** Field that breaks the rule */
  readonly field: NoteField

  /**
   * Create the error
   * @param field - Field that breaks the rule
   */
  constructor(field: NoteField) {
    super(`The note's ${field} is invalid.`)
    this.name = 'NoteValidationError'
    this.field = field
  }
}

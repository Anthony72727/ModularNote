import type { Note } from '../entity/models/Note'

/**
 * Add a note after validating it
 */
export interface AddNoteUseCase {
  /**
   * Validate the note, then save it
   * @param title - Title typed by the user
   * @param description - Description typed by the user, null or empty when there is none
   * @returns The saved note, with its id and creation date
   * @throws NoteValidationError if the title or the description is invalid
   * @throws NoteRejectedError if the server refuses the note
   */
  execute(title: string, description: string | null): Promise<Note>
}

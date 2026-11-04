import type { Note } from '../entity/models/Note'

/**
 * Add a note after validating it
 */
export interface AddNoteUseCase {
  /**
   * Validate the note, then save it with its links
   * @param title - Title typed by the user
   * @param description - Description typed by the user, null or empty when there is none
   * @param linkedNoteIds - Ids of the existing notes to link to the new note
   * @returns The saved note, with its id and creation date
   * @throws NoteValidationError if the title or the description is invalid
   * @throws NoteRejectedError if the server refuses the note
   * @throws LinkedNoteNotFoundError if a note to link does not exist anymore
   */
  execute(title: string, description: string | null, linkedNoteIds: string[]): Promise<Note>
}

import type { Note } from '../entity/models/Note'

/**
 * Modify a note after validating its new content
 */
export interface UpdateNoteUseCase {
  /**
   * Validate the new content of the note, then save it
   * @param id - Id of the note to modify
   * @param title - Title typed by the user
   * @param description - Description typed by the user, null or empty when there is none
   * @returns The saved note
   * @throws NoteValidationError if the title or the description is invalid
   * @throws NoteNotFoundError if the note does not exist anymore
   * @throws NoteRejectedError if the server refuses the note
   */
  execute(id: string, title: string, description: string | null): Promise<Note>
}

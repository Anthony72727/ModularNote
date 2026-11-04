import type { Note } from '../entity/models/Note'

/**
 * Read the notes linked to a note
 */
export interface GetNoteLinksUseCase {
  /**
   * Read the notes linked to a note
   * @param id - Id of the note
   * @param signal - Cancels the reading when the caller does not need the result anymore
   * @returns The linked notes, oldest first
   * @throws NoteNotFoundError if the note does not exist
   */
  execute(id: string, signal?: AbortSignal): Promise<Note[]>
}

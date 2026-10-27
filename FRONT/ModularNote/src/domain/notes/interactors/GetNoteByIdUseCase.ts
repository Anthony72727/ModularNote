import type { Note } from '../entity/models/Note'

/**
 * Get a single note by its id
 */
export interface GetNoteByIdUseCase {
  /**
   * Read a single note
   * @param id - Id of the note to read
   * @param signal - Cancels the reading when the caller does not need the result anymore
   * @returns The note with this id
   * @throws NoteNotFoundError if the note does not exist
   */
  execute(id: string, signal?: AbortSignal): Promise<Note>
}

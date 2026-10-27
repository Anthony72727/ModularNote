import type { Note } from '../entity/models/Note'

/**
 * Get every note
 */
export interface GetNotesUseCase {
  /**
   * Read every note
   * @param signal - Cancels the reading when the caller does not need the result anymore
   * @returns Every note, in no particular order
   */
  execute(signal?: AbortSignal): Promise<Note[]>
}

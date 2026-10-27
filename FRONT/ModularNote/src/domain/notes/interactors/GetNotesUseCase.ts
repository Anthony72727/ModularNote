import type { Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'

/**
 * Get every note
 */
export class GetNotesUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the notes are read
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /**
   * Read every note
   * @param signal - Cancels the reading when the caller does not need the result anymore
   * @returns Every note, in no particular order
   */
  execute(signal?: AbortSignal): Promise<Note[]> {
    return this.noteRepository.getAll(signal)
  }
}

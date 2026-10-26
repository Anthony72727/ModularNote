import type { Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'

/**
 * Get every note
 */
export class GetNotesUseCase {
  private readonly noteRepository: NoteRepository

  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /**
   * @param signal cancels the request when the caller does not need the result anymore
   */
  execute(signal?: AbortSignal): Promise<Note[]> {
    return this.noteRepository.getAll(signal)
  }
}

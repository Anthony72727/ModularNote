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

  execute(signal?: AbortSignal): Promise<Note[]> {
    return this.noteRepository.getAll(signal)
  }
}

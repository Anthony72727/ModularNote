import type { Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'

/**
 * Get a single note by its id
 */
export class GetNoteByIdUseCase {
  private readonly noteRepository: NoteRepository

  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /**
   * @throws NoteNotFoundError if the note does not exist
   */
  execute(id: string, signal?: AbortSignal): Promise<Note> {
    return this.noteRepository.getById(id, signal)
  }
}

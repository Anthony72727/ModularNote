import type { Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'
import type { GetNotesUseCase } from './GetNotesUseCase'

/**
 * GetNotesUseCase that reads the notes through a NoteRepository
 */
export class GetNotesUseCaseImpl implements GetNotesUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the notes are read
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /** @inheritDoc */
  execute(signal?: AbortSignal): Promise<Note[]> {
    return this.noteRepository.getAll(signal)
  }
}

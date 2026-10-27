import type { Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'
import type { GetNoteByIdUseCase } from './GetNoteByIdUseCase'

/**
 * GetNoteByIdUseCase that reads the note through a NoteRepository
 */
export class GetNoteByIdUseCaseImpl implements GetNoteByIdUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the note is read
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /** @inheritDoc */
  execute(id: string, signal?: AbortSignal): Promise<Note> {
    return this.noteRepository.getById(id, signal)
  }
}

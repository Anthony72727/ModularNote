import type { Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'
import type { GetNoteLinksUseCase } from './GetNoteLinksUseCase'

/**
 * GetNoteLinksUseCase that reads the notes through a NoteRepository
 */
export class GetNoteLinksUseCaseImpl implements GetNoteLinksUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the notes are read
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /** @inheritDoc */
  async execute(id: string, signal?: AbortSignal): Promise<Note[]> {
    return this.noteRepository.getLinkedNotes(id, signal)
  }
}

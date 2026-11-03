import type { NoteRepository } from '../repositories/NoteRepository'
import type { DeleteNoteUseCase } from './DeleteNoteUseCase'

/**
 * DeleteNoteUseCase that deletes the note through a NoteRepository
 */
export class DeleteNoteUseCaseImpl implements DeleteNoteUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the note is deleted
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /** @inheritDoc */
  async execute(id: string): Promise<void> {
    await this.noteRepository.delete(id)
  }
}

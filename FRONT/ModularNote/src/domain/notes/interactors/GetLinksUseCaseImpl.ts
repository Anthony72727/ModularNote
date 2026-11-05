import type { NoteLink } from '../entity/models/NoteLink'
import type { NoteRepository } from '../repositories/NoteRepository'
import type { GetLinksUseCase } from './GetLinksUseCase'

/**
 * GetLinksUseCase that reads the links through a NoteRepository
 */
export class GetLinksUseCaseImpl implements GetLinksUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the links are read
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /** @inheritDoc */
  async execute(signal?: AbortSignal): Promise<NoteLink[]> {
    return this.noteRepository.getAllLinks(signal)
  }
}

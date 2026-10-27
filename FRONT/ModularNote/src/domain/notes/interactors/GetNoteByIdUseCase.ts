import type { Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'

/**
 * Get a single note by its id
 */
export class GetNoteByIdUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the note is read
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /**
   * Read a single note
   * @param id - Id of the note to read
   * @param signal - Cancels the reading when the caller does not need the result anymore
   * @returns The note with this id
   * @throws NoteNotFoundError if the note does not exist
   */
  execute(id: string, signal?: AbortSignal): Promise<Note> {
    return this.noteRepository.getById(id, signal)
  }
}

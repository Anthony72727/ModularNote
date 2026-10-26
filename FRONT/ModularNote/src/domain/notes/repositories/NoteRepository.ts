import type { NewNote, Note } from '../entity/models/Note'

/**
 * Contract for reading and saving notes, implemented by the data layer
 */
export interface NoteRepository {
  getAll(signal?: AbortSignal): Promise<Note[]>

  /**
   * @throws NoteNotFoundError if the note does not exist
   */
  getById(id: string, signal?: AbortSignal): Promise<Note>

  /**
   * @throws NoteRejectedError if the server refuses the note
   */
  add(note: NewNote): Promise<Note>
}

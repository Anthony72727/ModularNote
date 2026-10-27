import type { NewNote, Note } from '../entity/models/Note'

/**
 * Contract for reading and saving notes, implemented by the data layer
 */
export interface NoteRepository {
  /**
   * Read every saved note
   * @param signal - Cancels the reading when the caller does not need the result anymore
   * @returns Every note, in no particular order
   */
  getAll(signal?: AbortSignal): Promise<Note[]>

  /**
   * Read a single note
   * @param id - Id of the note to read
   * @param signal - Cancels the reading when the caller does not need the result anymore
   * @returns The note with this id
   * @throws NoteNotFoundError if the note does not exist
   */
  getById(id: string, signal?: AbortSignal): Promise<Note>

  /**
   * Save a new note
   * @param note - Note already validated by the domain
   * @returns The saved note, with its id and creation date
   * @throws NoteRejectedError if the server refuses the note
   */
  add(note: NewNote): Promise<Note>
}

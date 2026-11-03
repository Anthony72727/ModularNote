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
   * Read the notes linked to a note
   * @param id - Id of the note
   * @param signal - Cancels the reading when the caller does not need the result anymore
   * @returns The linked notes, oldest first
   * @throws NoteNotFoundError if the note does not exist
   */
  getLinkedNotes(id: string, signal?: AbortSignal): Promise<Note[]>

  /**
   * Save a new note and its links: either all of them are saved, or nothing is
   * @param note - Note already validated by the domain
   * @param linkedNoteIds - Ids of the existing notes to link to the new note
   * @returns The saved note, with its id and creation date
   * @throws NoteRejectedError if the server refuses the note
   * @throws LinkedNoteNotFoundError if a note to link does not exist anymore
   */
  add(note: NewNote, linkedNoteIds: string[]): Promise<Note>

  /**
   * Save the modifications of an existing note
   * @param id - Id of the note to modify
   * @param note - New content of the note, already validated by the domain
   * @returns The saved note
   * @throws NoteNotFoundError if the note does not exist anymore
   * @throws NoteRejectedError if the server refuses the note
   */
  update(id: string, note: NewNote): Promise<Note>

  /**
   * Delete a note
   * @param id - Id of the note to delete
   * @returns Nothing once the note is deleted
   * @throws NoteNotFoundError if the note does not exist anymore
   */
  delete(id: string): Promise<void>
}

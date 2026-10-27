import { createNewNote } from '../entity/models/Note'
import type { NewNote, Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'

/**
 * Add a note after validating it
 */
export class AddNoteUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the note is saved
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /**
   * Validate the note, then save it
   * @param title - Title typed by the user
   * @param description - Description typed by the user, null or empty when there is none
   * @returns The saved note, with its id and creation date
   * @throws NoteValidationError if the title or the description is invalid
   * @throws NoteRejectedError if the server refuses the note
   */
  async execute(title: string, description: string | null): Promise<Note> {
    const newNote: NewNote = createNewNote(title, description)
    return this.noteRepository.add(newNote)
  }
}

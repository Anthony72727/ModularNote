import { createNewNote } from '../entity/models/Note'
import type { NewNote, Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'

/**
 * Add a note after validating it
 */
export class AddNoteUseCase {
  private readonly noteRepository: NoteRepository

  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /**
   * @throws NoteValidationError if the title or the description is invalid
   * @throws NoteRejectedError if the server refuses the note
   */
  async execute(title: string, description: string | null): Promise<Note> {
    const newNote: NewNote = createNewNote(title, description)
    return this.noteRepository.add(newNote)
  }
}

import { createNewNote } from '../entity/models/Note'
import type { NewNote, Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'
import type { AddNoteUseCase } from './AddNoteUseCase'

/**
 * AddNoteUseCase that saves the note through a NoteRepository
 */
export class AddNoteUseCaseImpl implements AddNoteUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the note is saved
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /** @inheritDoc */
  async execute(title: string, description: string | null): Promise<Note> {
    const newNote: NewNote = createNewNote(title, description)
    return this.noteRepository.add(newNote)
  }
}

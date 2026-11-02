import { createNewNote } from '../entity/models/Note'
import type { NewNote, Note } from '../entity/models/Note'
import type { NoteRepository } from '../repositories/NoteRepository'
import type { UpdateNoteUseCase } from './UpdateNoteUseCase'

/**
 * UpdateNoteUseCase that saves the note through a NoteRepository
 */
export class UpdateNoteUseCaseImpl implements UpdateNoteUseCase {
  private readonly noteRepository: NoteRepository

  /**
   * Create the use case
   * @param noteRepository - Where the note is saved
   */
  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository
  }

  /** @inheritDoc */
  async execute(id: string, title: string, description: string | null): Promise<Note> {
    const content: NewNote = createNewNote(title, description)
    return this.noteRepository.update(id, content)
  }
}

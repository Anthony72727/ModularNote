import { HttpNoteRepository } from '../../data/notes/repositories/HttpNoteRepository'
import { AddNoteUseCaseImpl } from '../../domain/notes/interactors/AddNoteUseCaseImpl'
import { DeleteNoteUseCaseImpl } from '../../domain/notes/interactors/DeleteNoteUseCaseImpl'
import { GetNoteByIdUseCaseImpl } from '../../domain/notes/interactors/GetNoteByIdUseCaseImpl'
import { GetNoteLinksUseCaseImpl } from '../../domain/notes/interactors/GetNoteLinksUseCaseImpl'
import { GetNotesUseCaseImpl } from '../../domain/notes/interactors/GetNotesUseCaseImpl'
import { UpdateNoteUseCaseImpl } from '../../domain/notes/interactors/UpdateNoteUseCaseImpl'
import type { AddNoteUseCase } from '../../domain/notes/interactors/AddNoteUseCase'
import type { DeleteNoteUseCase } from '../../domain/notes/interactors/DeleteNoteUseCase'
import type { GetNoteByIdUseCase } from '../../domain/notes/interactors/GetNoteByIdUseCase'
import type { GetNoteLinksUseCase } from '../../domain/notes/interactors/GetNoteLinksUseCase'
import type { GetNotesUseCase } from '../../domain/notes/interactors/GetNotesUseCase'
import type { UpdateNoteUseCase } from '../../domain/notes/interactors/UpdateNoteUseCase'
import type { NoteRepository } from '../../domain/notes/repositories/NoteRepository'
import { HttpClient } from '../http/HttpClient'

/**
 * Every use case available to the presentation layer
 */
export type Dependencies = {
  /** Read every note */
  getNotes: GetNotesUseCase
  /** Read a single note */
  getNoteById: GetNoteByIdUseCase
  /** Read the notes linked to a note */
  getNoteLinks: GetNoteLinksUseCase
  /** Validate and save a new note */
  addNote: AddNoteUseCase
  /** Validate and save the modifications of a note */
  updateNote: UpdateNoteUseCase
  /** Delete a note */
  deleteNote: DeleteNoteUseCase
}

/**
 * Composition root: the only place that knows the implementations of the use cases and of the data layer
 * @returns Every use case, wired to the REST API
 */
export function createDependencies(): Dependencies {
  const httpClient: HttpClient = new HttpClient('/api')
  const noteRepository: NoteRepository = new HttpNoteRepository(httpClient)

  return {
    getNotes: new GetNotesUseCaseImpl(noteRepository),
    getNoteById: new GetNoteByIdUseCaseImpl(noteRepository),
    getNoteLinks: new GetNoteLinksUseCaseImpl(noteRepository),
    addNote: new AddNoteUseCaseImpl(noteRepository),
    updateNote: new UpdateNoteUseCaseImpl(noteRepository),
    deleteNote: new DeleteNoteUseCaseImpl(noteRepository),
  }
}

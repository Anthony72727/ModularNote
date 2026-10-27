import { HttpNoteRepository } from '../../data/notes/repositories/HttpNoteRepository'
import { AddNoteUseCase } from '../../domain/notes/interactors/AddNoteUseCase'
import { GetNoteByIdUseCase } from '../../domain/notes/interactors/GetNoteByIdUseCase'
import { GetNotesUseCase } from '../../domain/notes/interactors/GetNotesUseCase'
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
  /** Validate and save a new note */
  addNote: AddNoteUseCase
}

/**
 * Composition root: the only place that knows the implementations of the data layer
 * @returns Every use case, wired to the REST API
 */
export function createDependencies(): Dependencies {
  const httpClient: HttpClient = new HttpClient('/api')
  const noteRepository: NoteRepository = new HttpNoteRepository(httpClient)

  return {
    getNotes: new GetNotesUseCase(noteRepository),
    getNoteById: new GetNoteByIdUseCase(noteRepository),
    addNote: new AddNoteUseCase(noteRepository),
  }
}

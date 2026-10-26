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
  getNotes: GetNotesUseCase
  getNoteById: GetNoteByIdUseCase
  addNote: AddNoteUseCase
}

/**
 * Composition root: the only place that knows the implementations of the data layer
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

import { vi } from 'vitest'
import type { Mock } from 'vitest'
import type { NewNote, Note } from '../entity/models/Note'
import type { NoteRepository } from './NoteRepository'

/**
 * NoteRepository whose methods are mocks, for the use case tests
 */
export type FakeNoteRepository = {
  /** Mock of NoteRepository.getAll */
  getAll: Mock<(signal?: AbortSignal) => Promise<Note[]>>
  /** Mock of NoteRepository.getById */
  getById: Mock<(id: string, signal?: AbortSignal) => Promise<Note>>
  /** Mock of NoteRepository.add */
  add: Mock<(note: NewNote) => Promise<Note>>
} & NoteRepository

/**
 * Create a repository whose methods return nothing until a test sets their result
 * @returns A repository whose methods are all mocks
 */
export function createFakeNoteRepository(): FakeNoteRepository {
  return {
    getAll: vi.fn<(signal?: AbortSignal) => Promise<Note[]>>(),
    getById: vi.fn<(id: string, signal?: AbortSignal) => Promise<Note>>(),
    add: vi.fn<(note: NewNote) => Promise<Note>>(),
  }
}

/**
 * Build a saved note for the tests, with only the fields that matter overridden
 * @param overrides - Fields to change from the default note
 * @returns A complete note
 */
export function aNote(overrides: Partial<Note> = {}): Note {
  return {
    id: '0199f0c2-0000-7000-8000-000000000001',
    title: 'Une idée',
    description: 'Sa description',
    createdAt: new Date('2026-10-26T10:00:00Z'),
    ...overrides,
  }
}

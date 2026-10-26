// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { ApiError } from '../../../core/http/ApiError'
import { aNote, createFakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { useNotesViewModel } from './useNotesViewModel'

afterEach(cleanup)

describe('useNotesViewModel', () => {
  it('lists the notes, newest first', async () => {
    const repository = createFakeNoteRepository()
    const older = aNote({ id: 'old', createdAt: new Date('2026-10-01T10:00:00Z') })
    const newer = aNote({ id: 'new', createdAt: new Date('2026-10-20T10:00:00Z') })
    repository.getAll.mockResolvedValue([older, newer])
    const { wrapper } = createTestContext(repository)

    const { result } = renderHook(() => useNotesViewModel(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.notes.map((note) => note.id)).toEqual(['new', 'old'])
    expect(result.current.loadError).toBeNull()
  })

  it('opens a note, closes it on a second toggle, and closes it with closeNote', () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([aNote({ id: 'abc' })])
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useNotesViewModel(), { wrapper })

    act(() => result.current.toggleNote('abc'))
    expect(result.current.selectedNoteId).toBe('abc')

    act(() => result.current.toggleNote('abc'))
    expect(result.current.selectedNoteId).toBeNull()

    act(() => result.current.toggleNote('abc'))
    act(() => result.current.closeNote())
    expect(result.current.selectedNoteId).toBeNull()
  })

  it('shows an error when the notes cannot be loaded, and loads them again on retry', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockRejectedValueOnce(new ApiError(500, 'boom')).mockResolvedValue([aNote()])
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useNotesViewModel(), { wrapper })

    await waitFor(() =>
      expect(result.current.loadError).toBe('Le serveur a rencontré une erreur, réessaie dans un instant.'),
    )

    act(() => result.current.retry())

    await waitFor(() => expect(result.current.notes).toHaveLength(1))
    expect(result.current.loadError).toBeNull()
    expect(repository.getAll).toHaveBeenCalledTimes(2)
  })
})

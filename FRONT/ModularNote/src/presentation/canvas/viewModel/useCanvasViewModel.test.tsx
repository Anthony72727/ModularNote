// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { ApiError } from '../../../core/http/ApiError'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import { aNote, createFakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { useCanvasViewModel } from './useCanvasViewModel'

const noteA = aNote({ id: 'a', title: 'Idée A' })
const noteB = aNote({ id: 'b', title: 'Idée B' })
const link = { id: 'link', noteAId: 'a', noteBId: 'b' }

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderViewModel(repository = createFakeNoteRepository()) {
  const { wrapper } = createTestContext(repository)
  return renderHook(() => useCanvasViewModel(), { wrapper })
}

describe('useCanvasViewModel', () => {
  it('loads the notes and the links, and computes a position for every note', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([noteA, noteB])
    repository.getAllLinks.mockResolvedValue([link])

    const { result } = renderViewModel(repository)

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.notes).toEqual([noteA, noteB])
    expect(result.current.links).toEqual([link])
    expect(Object.keys(result.current.positions).sort()).toEqual(['a', 'b'])
  })

  it('ignores a link whose note is not shown anymore', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([noteA])
    repository.getAllLinks.mockResolvedValue([link])

    const { result } = renderViewModel(repository)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.links).toEqual([])
  })

  it('shows an error when the links cannot be loaded, then loads them again on retry', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([noteA, noteB])
    repository.getAllLinks.mockRejectedValueOnce(new ApiError(500, 'Erreur'))

    const { result } = renderViewModel(repository)

    await waitFor(() => expect(result.current.loadError).not.toBeNull())

    act(() => result.current.retry())

    await waitFor(() => expect(result.current.loadError).toBeNull())
    expect(repository.getAllLinks).toHaveBeenCalledTimes(2)
    expect(repository.getAll).toHaveBeenCalledTimes(1)
  })

  it('removes a deleted note and its links at once, after a confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([noteA, noteB])
    repository.getAllLinks.mockResolvedValue([link])
    repository.delete.mockResolvedValue()

    const { result } = renderViewModel(repository)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.requestDeletion(noteB))

    await waitFor(() => expect(result.current.notes).toEqual([noteA]))
    expect(repository.delete).toHaveBeenCalledExactlyOnceWith('b')
    expect(result.current.links).toEqual([])
  })

  it('shows an explicit error and removes the note when it does not exist anymore', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([noteA, noteB])
    repository.delete.mockRejectedValue(new NoteNotFoundError('b'))

    const { result } = renderViewModel(repository)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.requestDeletion(noteB))

    await waitFor(() => expect(result.current.deletionError).not.toBeNull())
    expect(result.current.notes).toEqual([noteA])
  })
})

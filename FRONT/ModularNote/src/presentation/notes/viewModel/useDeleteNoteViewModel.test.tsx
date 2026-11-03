// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { ApiError } from '../../../core/http/ApiError'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { aNote, createFakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { noteQueryKeys } from './noteQueryKeys'
import { useDeleteNoteViewModel } from './useDeleteNoteViewModel'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useDeleteNoteViewModel', () => {
  it('asks for a confirmation with the title of the note', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { wrapper } = createTestContext(createFakeNoteRepository())
    const { result } = renderHook(() => useDeleteNoteViewModel(() => {}), { wrapper })

    act(() => result.current.requestDeletion(aNote({ title: 'Mon idée' })))

    expect(confirm).toHaveBeenCalledExactlyOnceWith('Supprimer l\'idée "Mon idée" ?')
  })

  it('deletes nothing when the user refuses', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const repository = createFakeNoteRepository()
    const note = aNote({ id: 'abc' })
    const onNoteRemoved = vi.fn()
    const { queryClient, wrapper } = createTestContext(repository)
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, [note])
    const { result } = renderHook(() => useDeleteNoteViewModel(onNoteRemoved), { wrapper })

    act(() => result.current.requestDeletion(note))

    expect(result.current.isDeleting).toBe(false)
    expect(repository.delete).not.toHaveBeenCalled()
    expect(onNoteRemoved).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(noteQueryKeys.all)).toEqual([note])
  })

  it('removes the note from the caches and tells it is removed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repository = createFakeNoteRepository()
    repository.delete.mockResolvedValue()
    const note = aNote({ id: 'abc' })
    const other = aNote({ id: 'other' })
    const onNoteRemoved = vi.fn()
    const { queryClient, wrapper } = createTestContext(repository)
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, [other, note])
    queryClient.setQueryData<Note>(noteQueryKeys.detail('abc'), note)
    const { result } = renderHook(() => useDeleteNoteViewModel(onNoteRemoved), { wrapper })

    act(() => result.current.requestDeletion(note))

    await waitFor(() => expect(onNoteRemoved).toHaveBeenCalledExactlyOnceWith('abc'))
    expect(repository.delete).toHaveBeenCalledExactlyOnceWith('abc')
    expect(queryClient.getQueryData(noteQueryKeys.all)).toEqual([other])
    expect(queryClient.getQueryData(noteQueryKeys.detail('abc'))).toBeUndefined()
    await waitFor(() => expect(result.current.isDeleting).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('forgets the links of the note and refreshes those of the other notes', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repository = createFakeNoteRepository()
    repository.delete.mockResolvedValue()
    const note = aNote({ id: 'abc' })
    const onNoteRemoved = vi.fn()
    const { queryClient, wrapper } = createTestContext(repository)
    queryClient.setQueryData<Note[]>(noteQueryKeys.links('abc'), [])
    queryClient.setQueryData<Note[]>(noteQueryKeys.links('other'), [note])
    const { result } = renderHook(() => useDeleteNoteViewModel(onNoteRemoved), { wrapper })

    act(() => result.current.requestDeletion(note))

    await waitFor(() => expect(onNoteRemoved).toHaveBeenCalledOnce())
    expect(queryClient.getQueryState(noteQueryKeys.links('abc'))).toBeUndefined()
    expect(queryClient.getQueryState(noteQueryKeys.links('other'))?.isInvalidated).toBe(true)
  })

  it('shows an explicit error and removes the note when it does not exist anymore', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repository = createFakeNoteRepository()
    repository.delete.mockRejectedValue(new NoteNotFoundError('abc'))
    const note = aNote({ id: 'abc' })
    const onNoteRemoved = vi.fn()
    const { queryClient, wrapper } = createTestContext(repository)
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, [note])
    const { result } = renderHook(() => useDeleteNoteViewModel(onNoteRemoved), { wrapper })

    act(() => result.current.requestDeletion(note))

    await waitFor(() => expect(result.current.error).toBe("Cette idée n'existe plus."))
    expect(onNoteRemoved).toHaveBeenCalledExactlyOnceWith('abc')
    expect(queryClient.getQueryData(noteQueryKeys.all)).toEqual([])
  })

  it('keeps the note when the deletion fails for another reason, and clears the error on the next request', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repository = createFakeNoteRepository()
    repository.delete.mockRejectedValue(new ApiError(500, 'boom'))
    const note = aNote({ id: 'abc' })
    const onNoteRemoved = vi.fn()
    const { queryClient, wrapper } = createTestContext(repository)
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, [note])
    const { result } = renderHook(() => useDeleteNoteViewModel(onNoteRemoved), { wrapper })

    act(() => result.current.requestDeletion(note))

    await waitFor(() =>
      expect(result.current.error).toBe('Le serveur a rencontré une erreur, réessaie dans un instant.'),
    )
    expect(onNoteRemoved).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(noteQueryKeys.all)).toEqual([note])

    confirm.mockReturnValue(false)
    act(() => result.current.requestDeletion(note))

    await waitFor(() => expect(result.current.error).toBeNull())
  })

  it('ignores a new request while a deletion is being sent', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repository = createFakeNoteRepository()
    repository.delete.mockReturnValue(new Promise<void>(() => {}))
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useDeleteNoteViewModel(() => {}), { wrapper })

    act(() => result.current.requestDeletion(aNote()))
    await waitFor(() => expect(result.current.isDeleting).toBe(true))
    act(() => result.current.requestDeletion(aNote()))

    expect(confirm).toHaveBeenCalledOnce()
    expect(repository.delete).toHaveBeenCalledOnce()
  })
})

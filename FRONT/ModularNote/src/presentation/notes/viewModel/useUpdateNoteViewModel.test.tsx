// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { aNote, createFakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { noteQueryKeys } from './noteQueryKeys'
import { useUpdateNoteViewModel } from './useUpdateNoteViewModel'

afterEach(cleanup)

describe('useUpdateNoteViewModel', () => {
  it('starts with the values of the note, an absent description being empty', () => {
    const { wrapper } = createTestContext(createFakeNoteRepository())
    const note = aNote({ title: 'Une idée', description: null })

    const { result } = renderHook(() => useUpdateNoteViewModel(note, () => {}), { wrapper })

    expect(result.current.title).toBe('Une idée')
    expect(result.current.description).toBe('')
  })

  it('replaces the note in the cached list and in the details cache, then tells it is saved', async () => {
    const repository = createFakeNoteRepository()
    const other = aNote({ id: 'other' })
    const note = aNote({ id: 'abc', title: 'Ancien titre' })
    const saved = aNote({ id: 'abc', title: 'Nouveau titre' })
    repository.update.mockResolvedValue(saved)
    const onSaved = vi.fn()
    const { queryClient, wrapper } = createTestContext(repository)
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, [other, note])
    const { result } = renderHook(() => useUpdateNoteViewModel(note, onSaved), { wrapper })

    act(() => result.current.changeTitle('  Nouveau titre '))
    act(() => result.current.submit())

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
    expect(repository.update).toHaveBeenCalledExactlyOnceWith('abc', {
      title: 'Nouveau titre',
      description: 'Sa description',
    })
    expect(queryClient.getQueryData(noteQueryKeys.all)).toEqual([other, saved])
    expect(queryClient.getQueryData(noteQueryKeys.detail('abc'))).toBe(saved)
  })

  it('rejects a blank title without calling the API, keeps the input and points at the title', async () => {
    const repository = createFakeNoteRepository()
    const onSaved = vi.fn()
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useUpdateNoteViewModel(aNote(), onSaved), { wrapper })

    act(() => result.current.changeTitle('   '))
    act(() => result.current.submit())

    await waitFor(() =>
      expect(result.current.error).toBe('Le titre est obligatoire et ne doit pas dépasser 100 caractères.'),
    )
    expect(result.current.invalidField).toBe('title')
    expect(result.current.title).toBe('   ')
    expect(repository.update).not.toHaveBeenCalled()
    expect(onSaved).not.toHaveBeenCalled()
  })

  it('shows an explicit error and refreshes the list when the note does not exist anymore', async () => {
    const repository = createFakeNoteRepository()
    const note = aNote({ id: 'abc' })
    repository.update.mockRejectedValue(new NoteNotFoundError('abc'))
    const onSaved = vi.fn()
    const { queryClient, wrapper } = createTestContext(repository)
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, [note])
    const { result } = renderHook(() => useUpdateNoteViewModel(note, onSaved), { wrapper })

    act(() => result.current.submit())

    await waitFor(() => expect(result.current.error).toBe("Cette idée n'existe plus."))
    expect(queryClient.getQueryState(noteQueryKeys.all)?.isInvalidated).toBe(true)
    expect(onSaved).not.toHaveBeenCalled()
  })

  it('clears the error as soon as the user edits a field', async () => {
    const { wrapper } = createTestContext(createFakeNoteRepository())
    const { result } = renderHook(() => useUpdateNoteViewModel(aNote({ title: '' }), () => {}), { wrapper })
    act(() => result.current.submit())
    await waitFor(() => expect(result.current.error).not.toBeNull())

    act(() => result.current.changeDescription('D'))

    await waitFor(() => expect(result.current.error).toBeNull())
    expect(result.current.invalidField).toBeNull()
  })

  it('ignores a new submit while the previous one is still running', async () => {
    const repository = createFakeNoteRepository()
    repository.update.mockReturnValue(new Promise<Note>(() => {}))
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useUpdateNoteViewModel(aNote(), () => {}), { wrapper })

    act(() => result.current.submit())
    await waitFor(() => expect(result.current.isSubmitting).toBe(true))
    act(() => result.current.submit())

    expect(repository.update).toHaveBeenCalledOnce()
  })
})

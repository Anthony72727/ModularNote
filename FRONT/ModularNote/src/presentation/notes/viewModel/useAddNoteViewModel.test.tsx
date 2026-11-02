// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { NoteRejectedError } from '../../../domain/notes/entity/errors/NoteRejectedError'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { aNote, createFakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { noteQueryKeys } from './noteQueryKeys'
import { MAX_RECENT_NOTES, useAddNoteViewModel } from './useAddNoteViewModel'

afterEach(cleanup)

describe('useAddNoteViewModel', () => {
  it('adds the note to the cached list and to the details cache, then empties the form', async () => {
    const repository = createFakeNoteRepository()
    const existing = aNote({ id: 'existing' })
    const created = aNote({ id: 'created', title: 'Mon idée', description: null })
    repository.add.mockResolvedValue(created)
    const { queryClient, wrapper } = createTestContext(repository)
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, [existing])
    const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

    act(() => result.current.changeTitle('  Mon idée '))
    act(() => result.current.submit())

    await waitFor(() => expect(result.current.title).toBe(''))
    expect(repository.add).toHaveBeenCalledExactlyOnceWith({ title: 'Mon idée', description: null })
    expect(queryClient.getQueryData(noteQueryKeys.all)).toEqual([existing, created])
    expect(queryClient.getQueryData(noteQueryKeys.detail('created'))).toBe(created)
    expect(result.current.description).toBe('')
    expect(result.current.error).toBeNull()
  })

  it('rejects a blank title without calling the API, keeps the input and points at the title', async () => {
    const repository = createFakeNoteRepository()
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

    act(() => result.current.changeTitle('   '))
    act(() => result.current.changeDescription('Une description'))
    act(() => result.current.submit())

    await waitFor(() =>
      expect(result.current.error).toBe('Le titre est obligatoire et ne doit pas dépasser 100 caractères.'),
    )
    expect(result.current.invalidField).toBe('title')
    expect(result.current.description).toBe('Une description')
    expect(repository.add).not.toHaveBeenCalled()
  })

  it('clears the error as soon as the user edits a field', async () => {
    const { wrapper } = createTestContext(createFakeNoteRepository())
    const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })
    act(() => result.current.submit())
    await waitFor(() => expect(result.current.error).not.toBeNull())

    act(() => result.current.changeTitle('M'))

    await waitFor(() => expect(result.current.error).toBeNull())
    expect(result.current.invalidField).toBeNull()
  })

  it('does not point at a field when the server rejects the note', async () => {
    const repository = createFakeNoteRepository()
    repository.add.mockRejectedValue(new NoteRejectedError())
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

    act(() => result.current.changeTitle('Mon idée'))
    act(() => result.current.submit())

    await waitFor(() =>
      expect(result.current.error).toBe("L'idée est invalide, vérifie le titre et la description."),
    )
    expect(result.current.invalidField).toBeNull()
    expect(result.current.title).toBe('Mon idée')
  })

  it('ignores a new submit while the previous one is still running', async () => {
    const repository = createFakeNoteRepository()
    repository.add.mockReturnValue(new Promise<Note>(() => {}))
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

    act(() => result.current.changeTitle('Mon idée'))
    act(() => result.current.submit())
    await waitFor(() => expect(result.current.isSubmitting).toBe(true))
    act(() => result.current.submit())

    expect(repository.add).toHaveBeenCalledOnce()
  })

  it('tells whether the title is blank', () => {
    const { wrapper } = createTestContext(createFakeNoteRepository())
    const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

    expect(result.current.isTitleBlank).toBe(true)
    act(() => result.current.changeTitle('   '))
    expect(result.current.isTitleBlank).toBe(true)
    act(() => result.current.changeTitle(' a '))
    expect(result.current.isTitleBlank).toBe(false)
  })

  it('keeps the last created notes, newest first, up to the limit', async () => {
    const repository = createFakeNoteRepository()
    let count = 0
    repository.add.mockImplementation(async () => aNote({ id: String(++count) }))
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

    for (let index = 1; index <= MAX_RECENT_NOTES + 1; index++) {
      act(() => result.current.changeTitle(`Idée ${index}`))
      act(() => result.current.submit())
      await waitFor(() => expect(result.current.recentNotes[0]?.id).toBe(String(index)))
    }

    expect(result.current.recentNotes.map((note) => note.id)).toEqual(['6', '5', '4', '3', '2'])
  })
})

// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { ApiError } from '../../../core/http/ApiError'
import { LinkedNoteNotFoundError } from '../../../domain/notes/entity/errors/LinkedNoteNotFoundError'
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
    expect(repository.add).toHaveBeenCalledExactlyOnceWith({ title: 'Mon idée', description: null }, [])
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

  describe('linked notes', () => {
    it('sends the ids of the chosen notes, once each, then empties the choice and refreshes the links', async () => {
      const repository = createFakeNoteRepository()
      repository.add.mockResolvedValue(aNote({ id: 'created' }))
      const { queryClient, wrapper } = createTestContext(repository)
      queryClient.setQueryData<Note[]>(noteQueryKeys.links('first'), [])
      const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

      act(() => result.current.changeTitle('Mon idée'))
      act(() => result.current.addLinkedNote(aNote({ id: 'first' })))
      act(() => result.current.addLinkedNote(aNote({ id: 'first' })))
      act(() => result.current.addLinkedNote(aNote({ id: 'second' })))
      act(() => result.current.submit())

      await waitFor(() => expect(result.current.linkedNotes).toEqual([]))
      expect(repository.add).toHaveBeenCalledExactlyOnceWith({ title: 'Mon idée', description: null }, ['first', 'second'])
      expect(queryClient.getQueryState(noteQueryKeys.links('first'))?.isInvalidated).toBe(true)
    })

    it('gives up a chosen note', () => {
      const { wrapper } = createTestContext(createFakeNoteRepository())
      const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

      act(() => result.current.addLinkedNote(aNote({ id: 'first' })))
      act(() => result.current.removeLinkedNote('first'))

      expect(result.current.linkedNotes).toEqual([])
    })

    it('counts a chosen note as unsaved input', () => {
      const { wrapper } = createTestContext(createFakeNoteRepository())
      const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

      act(() => result.current.addLinkedNote(aNote()))

      expect(result.current.hasUnsavedInput).toBe(true)
    })

    it('names the note that does not exist anymore, stops linking it and keeps the input', async () => {
      const repository = createFakeNoteRepository()
      const kept = aNote({ id: 'kept', title: 'Gardée' })
      const gone = aNote({ id: 'gone', title: 'Disparue' })
      repository.add.mockRejectedValue(new LinkedNoteNotFoundError())
      repository.getAll.mockResolvedValue([kept])
      const { queryClient, wrapper } = createTestContext(repository)
      queryClient.setQueryData<Note[]>(noteQueryKeys.all, [kept, gone])
      const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

      act(() => result.current.changeTitle('Mon idée'))
      act(() => result.current.addLinkedNote(kept))
      act(() => result.current.addLinkedNote(gone))
      act(() => result.current.submit())

      await waitFor(() => expect(result.current.error).toBe("L'idée liée « Disparue » n'existe plus."))
      expect(result.current.linkedNotes).toEqual([kept])
      expect(result.current.title).toBe('Mon idée')
      expect(queryClient.getQueryData(noteQueryKeys.all)).toEqual([kept])
    })

    it('clears the name of the missing note as soon as the user edits the form', async () => {
      const repository = createFakeNoteRepository()
      repository.add.mockRejectedValue(new LinkedNoteNotFoundError())
      repository.getAll.mockResolvedValue([])
      const { wrapper } = createTestContext(repository)
      const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })
      act(() => result.current.changeTitle('Mon idée'))
      act(() => result.current.addLinkedNote(aNote({ title: 'Disparue' })))
      act(() => result.current.submit())
      await waitFor(() => expect(result.current.error).toBe("L'idée liée « Disparue » n'existe plus."))

      act(() => result.current.changeTitle('Mon idée 2'))

      await waitFor(() => expect(result.current.error).toBeNull())
    })

    it('keeps a generic message and the chosen notes when the notes cannot be read again', async () => {
      const repository = createFakeNoteRepository()
      const linked = aNote({ title: 'Peut-être disparue' })
      repository.add.mockRejectedValue(new LinkedNoteNotFoundError())
      repository.getAll.mockRejectedValue(new ApiError(500, 'boom'))
      const { wrapper } = createTestContext(repository)
      const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

      act(() => result.current.changeTitle('Mon idée'))
      act(() => result.current.addLinkedNote(linked))
      act(() => result.current.submit())

      await waitFor(() => expect(result.current.error).toBe("Une des idées liées n'existe plus."))
      expect(result.current.linkedNotes).toEqual([linked])
    })
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

  it('tells whether something was typed in the title or the description', () => {
    const { wrapper } = createTestContext(createFakeNoteRepository())
    const { result } = renderHook(() => useAddNoteViewModel(), { wrapper })

    expect(result.current.hasUnsavedInput).toBe(false)
    act(() => result.current.changeTitle('   '))
    expect(result.current.hasUnsavedInput).toBe(false)
    act(() => result.current.changeDescription('Détails'))
    expect(result.current.hasUnsavedInput).toBe(true)
    act(() => result.current.changeDescription(''))
    act(() => result.current.changeTitle('Mon idée'))
    expect(result.current.hasUnsavedInput).toBe(true)
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
